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
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessagingServiceImpl implements MessagingService {

  private final ConversationRepository conversationRepository;
  private final MessageRepository messageRepository;
  private final UserRepository userRepository;
  private final PropertyRepository propertyRepository;
  private final MessagingMapper messagingMapper;

  @Override
  public ConversationResponse createConversation(
      CreateConversationRequest request) {

    Conversation existingConversation = conversationRepository
        .findByBuyerIdAndSellerIdAndPropertyId(
            request.getBuyerId(),
            request.getSellerId(),
            request.getPropertyId())
        .orElse(null);

    if (existingConversation != null) {
      return messagingMapper.toConversationResponse(
          existingConversation);
    }

    User buyer = userRepository.findById(request.getBuyerId())
        .orElseThrow(() -> new RuntimeException("Buyer not found"));

    User seller = userRepository.findById(request.getSellerId())
        .orElseThrow(() -> new RuntimeException("Seller not found"));

    Property property = propertyRepository.findById(
        request.getPropertyId()).orElseThrow(() -> new RuntimeException("Property not found"));

    Conversation conversation = Conversation.builder()
        .buyer(buyer)
        .seller(seller)
        .property(property)
        .build();

    Conversation savedConversation = conversationRepository.save(conversation);

    return messagingMapper.toConversationResponse(
        savedConversation);
  }

  @Override
  @Transactional(readOnly = true)
  public ConversationResponse getConversationById(
      Long conversationId) {

    Conversation conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new RuntimeException(
            "Conversation not found"));

    return messagingMapper.toConversationResponse(
        conversation);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ConversationResponse> getBuyerConversations(
      Long buyerId) {

    return conversationRepository
        .findByBuyerIdOrderByCreatedAtDesc(buyerId)
        .stream()
        .map(messagingMapper::toConversationResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ConversationResponse> getSellerConversations(
      Long sellerId) {

    return conversationRepository
        .findBySellerIdOrderByCreatedAtDesc(sellerId)
        .stream()
        .map(messagingMapper::toConversationResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ConversationResponse> getPropertyConversations(
      Long propertyId) {

    return conversationRepository
        .findByPropertyIdOrderByCreatedAtDesc(propertyId)
        .stream()
        .map(messagingMapper::toConversationResponse)
        .toList();
  }

  @Override
  public MessageResponse sendMessage(
      Long conversationId,
      SendMessageRequest request) {

    Conversation conversation = conversationRepository.findById(conversationId)
        .orElseThrow(() -> new RuntimeException(
            "Conversation not found"));

    User sender = userRepository.findById(
        request.getSenderId()).orElseThrow(() -> new RuntimeException("Sender not found"));

    User receiver = userRepository.findById(
        request.getReceiverId()).orElseThrow(() -> new RuntimeException("Receiver not found"));

    validateConversationParticipants(
        conversation,
        sender.getId(),
        receiver.getId());

    Message message = Message.builder()
        .conversation(conversation)
        .sender(sender)
        .receiver(receiver)
        .content(request.getContent())
        .isRead(false)
        .build();

    Message savedMessage = messageRepository.save(message);

    return messagingMapper.toMessageResponse(
        savedMessage);
  }

  @Override
  @Transactional(readOnly = true)
  public List<MessageResponse> getConversationMessages(
      Long conversationId) {

    if (!conversationRepository.existsById(conversationId)) {
      throw new RuntimeException(
          "Conversation not found");
    }

    return messageRepository
        .findByConversationIdOrderByCreatedAtAsc(
            conversationId)
        .stream()
        .map(messagingMapper::toMessageResponse)
        .toList();
  }

  @Override
  public void markMessageAsRead(Long messageId) {

    Message message = messageRepository.findById(messageId)
        .orElseThrow(() -> new RuntimeException("Message not found"));

    message.setIsRead(true);

    messageRepository.save(message);
  }

  @Override
  @Transactional(readOnly = true)
  public List<MessageResponse> getUnreadMessages(
      Long receiverId) {

    return messageRepository
        .findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
            receiverId)
        .stream()
        .map(messagingMapper::toMessageResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public long getUnreadMessageCount(Long receiverId) {

    return messageRepository
        .countByReceiverIdAndIsReadFalse(receiverId);
  }

  @Override
  public void deleteMessage(Long messageId) {

    if (!messageRepository.existsById(messageId)) {
      throw new RuntimeException("Message not found");
    }

    messageRepository.deleteById(messageId);
  }

  private void validateConversationParticipants(
      Conversation conversation,
      Long senderId,
      Long receiverId) {

    Long buyerId = conversation.getBuyer().getId();
    Long sellerId = conversation.getSeller().getId();

    boolean validParticipants = (senderId.equals(buyerId)
        && receiverId.equals(sellerId))
        ||
        (senderId.equals(sellerId)
            && receiverId.equals(buyerId));

    if (!validParticipants) {
      throw new RuntimeException(
          "Sender and receiver are not participants "
              + "of this conversation");
    }
  }
}