package com.realestate.modules.messaging.service.impl;

import com.realestate.modules.messaging.dto.request.CreateConversationRequest;
import com.realestate.modules.messaging.dto.request.SendMessageRequest;
import com.realestate.modules.messaging.dto.response.ConversationResponse;
import com.realestate.modules.messaging.dto.response.MessageResponse;
import com.realestate.modules.messaging.entity.Conversation;
import com.realestate.modules.messaging.entity.Message;
import com.realestate.modules.messaging.mapper.MessagingMapper;
import com.realestate.modules.messaging.repository.ConversationRepository;
import com.realestate.modules.messaging.repository.MessageRepository;
import com.realestate.modules.messaging.service.MessagingService;
import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.service.NotificationService;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessagingServiceImpl implements MessagingService {

        private final ConversationRepository conversationRepository;
        private final MessageRepository messageRepository;
        private final PropertyRepository propertyRepository;
        private final MessagingMapper messagingMapper;
        private final AuthenticatedUserService authenticatedUserService;

        // Notification service
        private final NotificationService notificationService;

        // ============================================================
        // CREATE CONVERSATION
        // ============================================================

        @Override
        public ConversationResponse createConversation(
                        CreateConversationRequest request) {

                // Get logged-in user from JWT
                User buyer = authenticatedUserService.getCurrentUser();

                // Only BUYER can start a conversation
                if (buyer.getRole().getName() != RoleType.BUYER) {
                        throw new AccessDeniedException(
                                        "Only BUYER users can create conversations");
                }

                // Find seller
                User seller = propertyRepository
                                .findById(request.getPropertyId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Property not found"))
                                .getSeller();

                // Check seller ID from request matches property owner
                if (!seller.getId().equals(request.getSellerId())) {
                        throw new IllegalArgumentException(
                                        "Seller does not own this property");
                }

                // Find property
                Property property = propertyRepository.findById(
                                request.getPropertyId()).orElseThrow(
                                                () -> new RuntimeException(
                                                                "Property not found"));

                // Check existing conversation
                Conversation existingConversation = conversationRepository
                                .findByBuyerIdAndSellerIdAndPropertyId(
                                                buyer.getId(),
                                                seller.getId(),
                                                property.getId())
                                .orElse(null);

                if (existingConversation != null) {
                        return messagingMapper.toConversationResponse(
                                        existingConversation);
                }

                // Create conversation
                Conversation conversation = Conversation.builder()
                                .buyer(buyer)
                                .seller(seller)
                                .property(property)
                                .build();

                Conversation savedConversation = conversationRepository.save(conversation);

                return messagingMapper.toConversationResponse(
                                savedConversation);
        }

        // ============================================================
        // GET CONVERSATION BY ID
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public ConversationResponse getConversationById(
                        Long conversationId) {

                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Conversation not found"));

                validateConversationAccess(conversation);

                return messagingMapper.toConversationResponse(
                                conversation);
        }

        // ============================================================
        // GET BUYER CONVERSATIONS
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public List<ConversationResponse> getBuyerConversations(
                        Long buyerId) {

                User currentUser = authenticatedUserService.getCurrentUser();

                if (!currentUser.getId().equals(buyerId)) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view these conversations");
                }

                return conversationRepository
                                .findByBuyerIdOrderByCreatedAtDesc(buyerId)
                                .stream()
                                .map(messagingMapper::toConversationResponse)
                                .toList();
        }

        // ============================================================
        // GET SELLER CONVERSATIONS
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public List<ConversationResponse> getSellerConversations(
                        Long sellerId) {

                User currentUser = authenticatedUserService.getCurrentUser();

                if (!currentUser.getId().equals(sellerId)) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view these conversations");
                }

                return conversationRepository
                                .findBySellerIdOrderByCreatedAtDesc(sellerId)
                                .stream()
                                .map(messagingMapper::toConversationResponse)
                                .toList();
        }

        // ============================================================
        // GET PROPERTY CONVERSATIONS
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public List<ConversationResponse> getPropertyConversations(
                        Long propertyId) {

                Property property = propertyRepository.findById(propertyId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Property not found"));

                User currentUser = authenticatedUserService.getCurrentUser();

                /*
                 * Only the property seller can see all conversations
                 * related to their property.
                 */
                if (!property.getSeller()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new AccessDeniedException(
                                        "You are not authorized to view conversations "
                                                        + "for this property");
                }

                return conversationRepository
                                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                                .stream()
                                .map(messagingMapper::toConversationResponse)
                                .toList();
        }

        // ============================================================
        // SEND MESSAGE
        // ============================================================

        @Override
        public MessageResponse sendMessage(
                        Long conversationId,
                        SendMessageRequest request) {

                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Conversation not found"));

                // Get sender from JWT
                User sender = authenticatedUserService.getCurrentUser();

                // Receiver comes from request initially
                User receiver = propertyRepository
                                .findById(conversation.getProperty().getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Property not found"))
                                .getSeller();

                /*
                 * Determine the other participant.
                 *
                 * If sender is buyer -> receiver must be seller.
                 * If sender is seller -> receiver must be buyer.
                 */
                if (sender.getId().equals(
                                conversation.getBuyer().getId())) {

                        if (!request.getReceiverId().equals(
                                        conversation.getSeller().getId())) {

                                throw new AccessDeniedException(
                                                "Invalid receiver for this conversation");
                        }

                        receiver = conversation.getSeller();

                } else if (sender.getId().equals(
                                conversation.getSeller().getId())) {

                        if (!request.getReceiverId().equals(
                                        conversation.getBuyer().getId())) {

                                throw new AccessDeniedException(
                                                "Invalid receiver for this conversation");
                        }

                        receiver = conversation.getBuyer();

                } else {

                        throw new AccessDeniedException(
                                        "You are not a participant of this conversation");
                }

                // Create message
                Message message = Message.builder()
                                .conversation(conversation)
                                .sender(sender)
                                .receiver(receiver)
                                .content(request.getContent())
                                .isRead(false)
                                .build();

                Message savedMessage = messageRepository.save(message);

                // ========================================================
                // CREATE NOTIFICATION FOR RECEIVER
                // ========================================================

                CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                                .title("New Message")
                                .message(
                                                "You have received a new message from "
                                                                + getUserDisplayName(sender)
                                                                + ".")
                                .type("MESSAGE")
                                .build();

                notificationService.createNotification(
                                receiver,
                                notificationRequest);

                return messagingMapper.toMessageResponse(
                                savedMessage);
        }

        // ============================================================
        // GET CONVERSATION MESSAGES
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public List<MessageResponse> getConversationMessages(
                        Long conversationId) {

                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Conversation not found"));

                validateConversationAccess(conversation);

                return messageRepository
                                .findByConversationIdOrderByCreatedAtAsc(
                                                conversationId)
                                .stream()
                                .map(messagingMapper::toMessageResponse)
                                .toList();
        }

        // ============================================================
        // MARK MESSAGE AS READ
        // ============================================================

        @Override
        public void markMessageAsRead(Long messageId) {

                Message message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Message not found"));

                User currentUser = authenticatedUserService.getCurrentUser();

                // Only receiver can mark message as read
                if (!message.getReceiver()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new AccessDeniedException(
                                        "Only the receiver can mark this message as read");
                }

                message.setIsRead(true);

                messageRepository.save(message);
        }

        // ============================================================
        // GET UNREAD MESSAGES
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public List<MessageResponse> getUnreadMessages(
                        Long receiverId) {

                User currentUser = authenticatedUserService.getCurrentUser();

                if (!currentUser.getId().equals(receiverId)) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view these messages");
                }

                return messageRepository
                                .findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
                                                receiverId)
                                .stream()
                                .map(messagingMapper::toMessageResponse)
                                .toList();
        }

        // ============================================================
        // GET UNREAD MESSAGE COUNT
        // ============================================================

        @Override
        @Transactional(readOnly = true)
        public long getUnreadMessageCount(
                        Long receiverId) {

                User currentUser = authenticatedUserService.getCurrentUser();

                if (!currentUser.getId().equals(receiverId)) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view this count");
                }

                return messageRepository
                                .countByReceiverIdAndIsReadFalse(receiverId);
        }

        // ============================================================
        // DELETE MESSAGE
        // ============================================================

        @Override
        public void deleteMessage(Long messageId) {

                Message message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Message not found"));

                User currentUser = authenticatedUserService.getCurrentUser();

                // Only sender can delete their message
                if (!message.getSender()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new AccessDeniedException(
                                        "Only the sender can delete this message");
                }

                messageRepository.delete(message);
        }

        // ============================================================
        // CONVERSATION ACCESS VALIDATION
        // ============================================================

        private void validateConversationAccess(
                        Conversation conversation) {

                User currentUser = authenticatedUserService.getCurrentUser();

                Long currentUserId = currentUser.getId();

                boolean isBuyer = conversation.getBuyer()
                                .getId()
                                .equals(currentUserId);

                boolean isSeller = conversation.getSeller()
                                .getId()
                                .equals(currentUserId);

                if (!isBuyer && !isSeller) {
                        throw new AccessDeniedException(
                                        "You are not a participant of this conversation");
                }
        }

        // ============================================================
        // USER DISPLAY NAME
        // ============================================================

        private String getUserDisplayName(User user) {

                String firstName = user.getFirstName();
                String lastName = user.getLastName();

                if (firstName == null && lastName == null) {
                        return "User";
                }

                if (firstName == null) {
                        return lastName;
                }

                if (lastName == null) {
                        return firstName;
                }

                return firstName + " " + lastName;
        }
}