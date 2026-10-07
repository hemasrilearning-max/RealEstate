package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerMessageDTO;
import com.realestate.modules.Broker.dto.BrokerMessageRequestDTO;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.messaging.entity.Conversation;
import com.realestate.modules.messaging.entity.Message;
import com.realestate.modules.messaging.repository.ConversationRepository;
import com.realestate.modules.messaging.repository.MessageRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrokerMessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // ============================================================
    // CREATE MESSAGE
    // ============================================================

    public BrokerMessageDTO createMessage(
            Long brokerId,
            BrokerMessageDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Message data is required");
        }

        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new IllegalArgumentException("content is required");
        }

        if (dto.getPropertyId() == null) {
            throw new IllegalArgumentException("propertyId is required");
        }

        String recipientType =
                normalizeRecipientType(dto.getRecipientType());

        // --------------------------------------------------------
        // Get broker
        // --------------------------------------------------------

        User broker = userRepository.findById(brokerId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Broker not found: " + brokerId));

        // --------------------------------------------------------
        // Get property
        // --------------------------------------------------------

        Property property = propertyRepository.findById(
                        dto.getPropertyId())
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Property not found: "
                                        + dto.getPropertyId()));

        // --------------------------------------------------------
        // Validate broker is assigned to this property
        // --------------------------------------------------------

        if (property.getBroker() == null
                || property.getBroker().getId() == null
                || !brokerId.equals(
                        property.getBroker().getId())) {

            throw new AccessDeniedException(
                    "This property is not assigned to this broker");
        }

        // --------------------------------------------------------
        // Property owner
        // --------------------------------------------------------

        User owner = property.getSeller();

        if (owner == null) {
            throw new BrokerResourceNotFoundException(
                    "Property has no owner/seller");
        }

        User sender;
        User receiver;
        Conversation conversation;

        // ========================================================
        // BROKER -> BUYER
        //
        // This uses the SAME buyer/seller/broker conversation.
        // ========================================================

        if ("BUYER".equals(recipientType)) {

            Long buyerId = dto.getReceiverId();

            if (buyerId == null) {
                throw new IllegalArgumentException(
                        "receiverId (buyer user id) is required "
                                + "when recipientType is BUYER");
            }

            User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Buyer not found: " + buyerId));

            // ----------------------------------------------------
            // Find existing shared buyer conversation
            // ----------------------------------------------------

            conversation = findOrCreateBuyerConversation(
                    buyer,
                    owner,
                    broker,
                    property);

            sender = broker;
            receiver = buyer;

        }

        // ========================================================
        // BROKER -> OWNER
        //
        // Preserve the existing broker-owner private conversation.
        // ========================================================

        else {

            conversation = findOrCreateOwnerConversation(
                    broker,
                    owner,
                    property);

            sender = broker;

            // Optional explicit sender
            if (dto.getSenderId() != null) {

                User explicitSender =
                        userRepository.findById(dto.getSenderId())
                                .orElse(null);

                if (explicitSender != null) {
                    sender = explicitSender;
                }
            }

            // Explicit receiver
            if (dto.getReceiverId() != null) {

                receiver = userRepository.findById(
                                dto.getReceiverId())
                        .orElseThrow(() ->
                                new BrokerResourceNotFoundException(
                                        "Receiver not found: "
                                                + dto.getReceiverId()));

            } else {

                receiver = owner;
            }
        }

        // --------------------------------------------------------
        // Sender cannot equal receiver
        // --------------------------------------------------------

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "sender and receiver cannot be the same user");
        }

        // --------------------------------------------------------
        // Create message
        // --------------------------------------------------------

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(dto.getContent().trim())
                .isRead(false)
                .build();

        // IMPORTANT:
        // Store broker ID on every broker-related message.
        message.setBrokerId(brokerId);

        Message savedMessage =
                messageRepository.save(message);

        return mapToDTO(
                savedMessage,
                recipientType);
    }

    // ============================================================
    // FIND OR CREATE BUYER SHARED CONVERSATION
    // ============================================================

    private Conversation findOrCreateBuyerConversation(
            User buyer,
            User owner,
            User broker,
            Property property) {

        // Prefer broker_id on conversation; also keep findAll fallback
        // so property.broker still matches legacy rows.
        List<Conversation> conversations =
                conversationRepository.findAll();

        // --------------------------------------------------------
        // First find the existing buyer/seller/property conversation
        // --------------------------------------------------------

        for (Conversation conversation : conversations) {

            if (conversation.getBuyer() == null
                    || conversation.getSeller() == null
                    || conversation.getProperty() == null) {
                continue;
            }

            boolean sameBuyer =
                    buyer.getId().equals(
                            conversation.getBuyer().getId());

            boolean sameSeller =
                    owner.getId().equals(
                            conversation.getSeller().getId());

            boolean sameProperty =
                    property.getId().equals(
                            conversation.getProperty().getId());

            if (sameBuyer
                    && sameSeller
                    && sameProperty) {

                // ------------------------------------------------
                // Existing old conversation may not have broker.
                // Attach broker now.
                // ------------------------------------------------


                return conversation;
            }
        }

        // --------------------------------------------------------
        // Create new shared conversation
        // --------------------------------------------------------

        Conversation conversation =
                Conversation.builder()
                        .buyer(buyer)
                        .seller(owner)
                        .property(property)
                        .build();

        Conversation saved = conversationRepository.save(conversation);
        setConversationStatus(saved, "PENDING");
        return saved;
    }

    // ============================================================
    // FIND OR CREATE BROKER-OWNER PRIVATE CONVERSATION
    // ============================================================

    private Conversation findOrCreateOwnerConversation(
            User broker,
            User owner,
            Property property) {

        // Prefer broker_id on conversation; also keep findAll fallback
        // so property.broker still matches legacy rows.
        List<Conversation> conversations =
                conversationRepository.findAll();

        // --------------------------------------------------------
        // Existing broker-owner conversation
        //
        // Existing design stores broker in buyer column for
        // OWNER/private conversations.
        // We preserve this to avoid breaking existing data.
        // --------------------------------------------------------

        for (Conversation conversation : conversations) {

            if (conversation.getBuyer() == null
                    || conversation.getSeller() == null
                    || conversation.getProperty() == null) {
                continue;
            }

            boolean sameBroker =
                    broker.getId().equals(
                            conversation.getBuyer().getId());

            boolean sameOwner =
                    owner.getId().equals(
                            conversation.getSeller().getId());

            boolean sameProperty =
                    property.getId().equals(
                            conversation.getProperty().getId());

            if (sameBroker
                    && sameOwner
                    && sameProperty) {

                // Make sure the new broker column is populated.

                return conversation;
            }
        }

        // --------------------------------------------------------
        // Create new broker-owner conversation
        // --------------------------------------------------------

        Conversation conversation =
                Conversation.builder()
                        .buyer(broker)
                        .seller(owner)
                        .property(property)
                        .build();

        Conversation saved = conversationRepository.save(conversation);
        setConversationStatus(saved, "ACCEPTED");
        return saved;
    }

    // ============================================================
    // GET ALL BROKER MESSAGES
    // ============================================================

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getAllMessagesByBroker(Long brokerId) {

        java.util.LinkedHashMap<Long, Message> unique =
                new java.util.LinkedHashMap<>();

        // 1) Direct broker_id on messages
        try {
            List<Message> tagged = messageRepository.findByBrokerId(brokerId);
            if (tagged != null) {
                for (Message m : tagged) {
                    if (m.getId() != null) {
                        unique.put(m.getId(), m);
                    }
                }
            }
        } catch (Exception ignored) {
        }

        // 2) Messages in conversations on this broker's properties
        List<Property> brokerProperties =
                propertyRepository.findByBroker_Id(brokerId);

        java.util.Set<Long> propertyIds = new java.util.HashSet<>();
        if (brokerProperties != null) {
            for (Property property : brokerProperties) {
                if (property.getId() != null) {
                    propertyIds.add(property.getId());
                }
            }
        }

        if (!propertyIds.isEmpty()) {
            List<Conversation> allConvs = conversationRepository.findAll();
            if (allConvs != null) {
                for (Conversation c : allConvs) {
                    if (c == null || c.getProperty() == null) {
                        continue;
                    }
                    if (!propertyIds.contains(c.getProperty().getId())) {
                        continue;
                    }
                    try {
                        List<Message> msgs =
                                messageRepository
                                        .findByConversationIdOrderByCreatedAtAsc(
                                                c.getId());
                        if (msgs != null) {
                            for (Message m : msgs) {
                                if (m.getId() != null) {
                                    unique.put(m.getId(), m);
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        return unique.values().stream()
                .map(m -> mapToDTO(m, resolveRecipientType(m, brokerId)))
                .sorted((a, b) -> {
                    LocalDateTime da = a.getCreatedAt() != null
                            ? a.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime db = b.getCreatedAt() != null
                            ? b.getCreatedAt() : LocalDateTime.MIN;
                    return db.compareTo(da);
                })
                .collect(Collectors.toList());
    }


    // ============================================================
    // MESSAGES BY RECIPIENT TYPE
    // ============================================================

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getMessagesByRecipientType(
            Long brokerId,
            String recipientType) {

        String type = normalizeRecipientType(recipientType);

        return getAllMessagesByBroker(brokerId).stream()
                .filter(dto -> type.equals(dto.getRecipientType()))
                .collect(Collectors.toList());
    }

    // ============================================================
    // PAGINATED MESSAGES
    // ============================================================

    @Transactional(readOnly = true)
    public Page<BrokerMessageDTO> getMessagesByBrokerPaged(
            Long brokerId,
            int page,
            int size) {

        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 10;
        }

        List<BrokerMessageDTO> all = getAllMessagesByBroker(brokerId);
        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());

        return new PageImpl<>(
                all.subList(start, end),
                PageRequest.of(page, size),
                all.size());
    }

    // ============================================================
    // UNREAD MESSAGES
    // ============================================================

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getUnreadMessages(Long brokerId) {
        return getAllMessagesByBroker(brokerId).stream()
                .filter(dto -> !dto.isRead())
                .collect(Collectors.toList());
    }

    // ============================================================
    // MESSAGES BY PROPERTY
    // ============================================================

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getMessagesByProperty(
            Long brokerId,
            Long propertyId) {

        return getAllMessagesByBroker(brokerId).stream()
                .filter(dto -> propertyId != null
                        && propertyId.equals(dto.getPropertyId()))
                .collect(Collectors.toList());
    }

    // ============================================================
    // MESSAGES BY CONVERSATION
    // ============================================================

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getMessagesByConversation(
            Long brokerId,
            Long conversationId) {

        return getAllMessagesByBroker(brokerId).stream()
                .filter(dto -> conversationId != null
                        && conversationId.equals(dto.getConversationId()))
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET ONE MESSAGE
    // ============================================================

    @Transactional(readOnly = true)
    public BrokerMessageDTO getMessageById(Long brokerId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Message not found: " + messageId));

        return mapToDTO(message, resolveRecipientType(message, brokerId));
    }

    // ============================================================
    // MARK AS READ
    // ============================================================

    public BrokerMessageDTO markAsRead(Long brokerId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Message not found: " + messageId));
        message.setIsRead(true);
        Message saved = messageRepository.save(message);
        return mapToDTO(saved, resolveRecipientType(saved, brokerId));
    }

    // ============================================================
    // DELETE MESSAGE
    // ============================================================

    public void deleteMessage(Long brokerId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Message not found: " + messageId));
        messageRepository.delete(message);
    }

    // MESSAGE REQUESTS
    // ============================================================

    /**
     * Message requests for this broker (by property.broker_id).
     * Does not depend on conversations.broker_id.
     */
    @Transactional(readOnly = true)
    public List<BrokerMessageRequestDTO> getMessageRequests(Long brokerId) {

        List<Property> brokerProperties =
                propertyRepository.findByBroker_Id(brokerId);

        if (brokerProperties == null || brokerProperties.isEmpty()) {
            return List.of();
        }

        java.util.Set<Long> propertyIds = new java.util.HashSet<>();
        for (Property property : brokerProperties) {
            if (property.getId() != null) {
                propertyIds.add(property.getId());
            }
        }

        List<Conversation> all =
                conversationRepository.findAll();

        if (all == null || all.isEmpty()) {
            return List.of();
        }

        return all.stream()
                .filter(c -> c != null && c.getProperty() != null)
                .filter(c -> propertyIds.contains(c.getProperty().getId()))
                // skip private broker↔owner thread
                .filter(c -> c.getBuyer() == null
                        || !brokerId.equals(c.getBuyer().getId()))
                .filter(c -> {
                    String status = getConversationStatus(c);
                    return "PENDING".equalsIgnoreCase(status)
                            || "ACCEPTED".equalsIgnoreCase(status);
                })
                .map(this::mapRequest)
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getCreatedAt() != null
                            ? a.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime dateB = b.getCreatedAt() != null
                            ? b.getCreatedAt() : LocalDateTime.MIN;
                    return dateB.compareTo(dateA);
                })
                .collect(Collectors.toList());
    }


    /**
     * Conversation belongs to broker if property.broker_id matches.
     * Does not use Conversation.getBroker() (may not exist).
     */
    private boolean isConversationForBroker(
            Conversation conversation,
            Long brokerId) {

        if (conversation == null || brokerId == null) {
            return false;
        }

        if (conversation.getProperty() == null) {
            return false;
        }

        if (conversation.getProperty().getBroker() == null) {
            return false;
        }

        Long propBrokerId =
                conversation.getProperty().getBroker().getId();

        return propBrokerId != null && brokerId.equals(propBrokerId);
    }

    public BrokerMessageRequestDTO acceptMessageRequest(
            Long brokerId,
            Long conversationId) {

        Conversation conversation =
                conversationRepository.findById(
                        conversationId)
                        .orElseThrow(() ->
                                new BrokerResourceNotFoundException(
                                        "Conversation not found: "
                                                + conversationId));

        if (!isConversationForBroker(
                conversation,
                brokerId)) {

            throw new BrokerResourceNotFoundException(
                    "This conversation is not linked "
                            + "to your broker properties");
        }

        // --------------------------------------------------------
        // Make sure conversation has broker stored.
        // --------------------------------------------------------

        

        // --------------------------------------------------------
        // IMPORTANT:
        // One shared status for buyer + seller + broker.
        // --------------------------------------------------------

        setConversationStatus(conversation, "ACCEPTED");

        Conversation saved =
                conversationRepository.save(conversation);

        // Notify buyer so their UI unlocks (same pattern as owner accept message)
        try {
            User brokerUser = userRepository.findById(brokerId).orElse(null);
            User buyerUser = saved.getBuyer();
            if (brokerUser != null && buyerUser != null
                    && !brokerId.equals(buyerUser.getId())) {
                Message acceptMsg = Message.builder()
                        .conversation(saved)
                        .sender(brokerUser)
                        .receiver(buyerUser)
                        .content("Hi! Your message request has been accepted by the agent. How can I help you?")
                        .isRead(false)
                        .build();
                try {
                    // set broker_id on message if field exists
                    acceptMsg.setBrokerId(brokerId);
                } catch (Exception ignored) {}
                messageRepository.save(acceptMsg);
            }
        } catch (Exception ignored) {
            // do not fail accept if notification message fails
        }

        return mapRequest(saved);
    }

    // ============================================================
    // REJECT REQUEST
    // ============================================================

    public BrokerMessageRequestDTO rejectMessageRequest(
            Long brokerId,
            Long conversationId) {

        Conversation conversation =
                conversationRepository.findById(
                        conversationId)
                        .orElseThrow(() ->
                                new BrokerResourceNotFoundException(
                                        "Conversation not found: "
                                                + conversationId));

        if (!isConversationForBroker(
                conversation,
                brokerId)) {

            throw new BrokerResourceNotFoundException(
                    "This conversation is not linked "
                            + "to your broker properties");
        }

        // --------------------------------------------------------
        // Make sure conversation has broker stored.
        // --------------------------------------------------------

        

        // --------------------------------------------------------
        // Shared status becomes REJECTED.
        // --------------------------------------------------------

        setConversationStatus(conversation, "REJECTED");

        Conversation saved =
                conversationRepository.save(conversation);

        return mapRequest(saved);
    }

    // ============================================================
    // NORMALIZE RECIPIENT TYPE
    // ============================================================

    private String normalizeRecipientType(
            String value) {

        if (value == null || value.isBlank()) {
            return "BUYER";
        }

        String type =
                value.trim().toUpperCase(Locale.ROOT);

        if (!type.equals("BUYER")
                && !type.equals("OWNER")) {

            throw new IllegalArgumentException(
                    "recipientType must be BUYER or OWNER");
        }

        return type;
    }

    // ============================================================
    // RESOLVE RECIPIENT TYPE
    // ============================================================


    /**
     * BUYER = shared chat (conversation.buyer is a real buyer, not the broker)
     * OWNER = private broker–owner chat (conversation.buyer == broker)
     */
    private String resolveRecipientType(Message message, Long brokerId) {
        if (message == null || message.getConversation() == null) {
            return "BUYER";
        }
        Conversation c = message.getConversation();
        if (c.getBuyer() != null
                && brokerId != null
                && brokerId.equals(c.getBuyer().getId())) {
            return "OWNER";
        }
        return "BUYER";
    }

    private String resolveSenderRole(Message message, Long brokerId) {
        if (message == null || message.getSender() == null) {
            return null;
        }
        Long sid = message.getSender().getId();
        if (brokerId != null && brokerId.equals(sid)) {
            return "BROKER";
        }
        Conversation c = message.getConversation();
        if (c != null) {
            if (c.getBuyer() != null && sid.equals(c.getBuyer().getId())
                    && (brokerId == null || !brokerId.equals(c.getBuyer().getId()))) {
                return "BUYER";
            }
            if (c.getSeller() != null && sid.equals(c.getSeller().getId())) {
                return "SELLER";
            }
        }
        return "USER";
    }

    private BrokerMessageDTO mapToDTO(Message message, String recipientType) {
        Long propertyId = null;
        String propertyTitle = null;
        Long conversationId = null;
        String conversationStatus = null;
        Long buyerId = null;
        String buyerName = null;
        Long sellerId = null;
        String sellerName = null;
        Long brokerIdOnMsg = message.getBrokerId();

        Conversation conversation = message.getConversation();
        if (conversation != null) {
            conversationId = conversation.getId();
            conversationStatus = getConversationStatus(conversation);

            if (conversation.getProperty() != null) {
                propertyId = conversation.getProperty().getId();
                propertyTitle = conversation.getProperty().getTitle();
                if (brokerIdOnMsg == null
                        && conversation.getProperty().getBroker() != null) {
                    brokerIdOnMsg = conversation.getProperty().getBroker().getId();
                }
            }

            // Shared chat: buyer is conversation.buyer (unless private OWNER thread)
            if (conversation.getBuyer() != null) {
                boolean buyerIsBroker = brokerIdOnMsg != null
                        && brokerIdOnMsg.equals(conversation.getBuyer().getId());
                if (!buyerIsBroker) {
                    buyerId = conversation.getBuyer().getId();
                    buyerName = formatName(conversation.getBuyer());
                }
            }

            if (conversation.getSeller() != null) {
                sellerId = conversation.getSeller().getId();
                sellerName = formatName(conversation.getSeller());
            }

            // conversation.broker may not exist on entity – use property.broker only
        }

        String senderRole = resolveSenderRole(message, brokerIdOnMsg);

        return BrokerMessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .isRead(Boolean.TRUE.equals(message.getIsRead()))
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderName(formatName(message.getSender()))
                .senderRole(senderRole)
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .receiverName(formatName(message.getReceiver()))
                .propertyId(propertyId)
                .propertyTitle(propertyTitle)
                .brokerId(brokerIdOnMsg)
                .recipientType(recipientType != null ? recipientType : "BUYER")
                .conversationId(conversationId)
                .conversationStatus(conversationStatus)
                .buyerId(buyerId)
                .buyerName(buyerName)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .createdAt(message.getCreatedAt())
                .build();
    }

    private BrokerMessageRequestDTO mapRequest(Conversation conversation) {
        String status = getConversationStatus(conversation);

        String lastMessage = null;
        LocalDateTime lastMessageAt = null;
        try {
            List<Message> list = messageRepository
                    .findByConversationIdOrderByCreatedAtAsc(conversation.getId());
            if (list != null && !list.isEmpty()) {
                Message latest = list.get(list.size() - 1);
                lastMessage = latest.getContent();
                lastMessageAt = latest.getCreatedAt();
            }
        } catch (Exception ignored) {
        }

        Long brokerId = null;
        if (conversation.getProperty() != null
                && conversation.getProperty().getBroker() != null) {
            brokerId = conversation.getProperty().getBroker().getId();
        }

        // Buyer name: real buyer only (not broker private thread)
        Long buyerId = null;
        String buyerName = null;
        if (conversation.getBuyer() != null) {
            boolean buyerIsBroker = brokerId != null
                    && brokerId.equals(conversation.getBuyer().getId());
            if (!buyerIsBroker) {
                buyerId = conversation.getBuyer().getId();
                buyerName = formatName(conversation.getBuyer());
            }
        }

        return BrokerMessageRequestDTO.builder()
                .conversationId(conversation.getId())
                .buyerId(buyerId)
                .buyerName(buyerName)
                .buyerEmail(conversation.getBuyer() != null && buyerId != null
                        ? conversation.getBuyer().getEmail() : null)
                .buyerPhone(conversation.getBuyer() != null && buyerId != null
                        ? conversation.getBuyer().getPhone() : null)
                .sellerId(conversation.getSeller() != null
                        ? conversation.getSeller().getId() : null)
                .sellerName(formatName(conversation.getSeller()))
                .propertyId(conversation.getProperty() != null
                        ? conversation.getProperty().getId() : null)
                .propertyTitle(conversation.getProperty() != null
                        ? conversation.getProperty().getTitle() : null)
                .brokerId(brokerId)
                .status(status)
                .createdAt(conversation.getCreatedAt())
                .lastMessage(lastMessage)
                .lastMessageAt(lastMessageAt)
                .build();
    }

    /**
     * Read status without requiring Conversation.getStatus() at compile time
     * (works whether messaging entity has status field or not).
     */
    private String getConversationStatus(Conversation conversation) {
        if (conversation == null || conversation.getId() == null) {
            return "PENDING";
        }
        try {
            Object val = entityManager
                    .createNativeQuery(
                            "SELECT status FROM conversations WHERE id = ?1")
                    .setParameter(1, conversation.getId())
                    .getSingleResult();
            if (val == null) {
                return "PENDING";
            }
            String s = val.toString().trim();
            return s.isEmpty() ? "PENDING" : s.toUpperCase();
        } catch (Exception e) {
            // column missing or null
            return "PENDING";
        }
    }

    /**
     * Write status without requiring Conversation.setStatus() at compile time.
     */
    private void setConversationStatus(Conversation conversation, String status) {
        if (conversation == null || conversation.getId() == null || status == null) {
            return;
        }
        try {
            entityManager
                    .createNativeQuery(
                            "UPDATE conversations SET status = ?1 WHERE id = ?2")
                    .setParameter(1, status.toUpperCase())
                    .setParameter(2, conversation.getId())
                    .executeUpdate();
            entityManager.flush();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not update conversation status. "
                            + "Ensure conversations.status column exists: " + e.getMessage());
        }
    }

    private String formatName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last = user.getLastName() != null ? user.getLastName() : "";
        return (first + " " + last).trim();
    }
}
