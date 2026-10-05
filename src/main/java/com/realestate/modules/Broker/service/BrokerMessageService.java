package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerMessageDTO;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.messaging.entity.Message;
import com.realestate.modules.messaging.entity.Conversation;
import com.realestate.modules.messaging.repository.MessageRepository;
import com.realestate.modules.messaging.repository.ConversationRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Uses existing messages table + existing Message entity.
 * Requires broker_id column added to messages table and Message entity.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerMessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public BrokerMessageDTO createMessage(Long brokerId, BrokerMessageDTO dto) {
        if (dto.getSenderId() == null || dto.getReceiverId() == null) {
            throw new IllegalArgumentException("senderId and receiverId are required");
        }
        if (dto.getConversationId() == null) {
            throw new IllegalArgumentException("conversationId is required");
        }

        Conversation conversation = conversationRepository.findById(dto.getConversationId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Conversation not found: " + dto.getConversationId()));

        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Sender not found: " + dto.getSenderId()));

        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Receiver not found: " + dto.getReceiverId()));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(dto.getContent())
                .isRead(false)
                .build();

        // Set brokerId (requires the field in Message entity)
        message.setBrokerId(brokerId);

        return mapToDTO(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getAllMessagesByBroker(Long brokerId) {
        return messageRepository.findByBrokerId(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrokerMessageDTO> getMessagesByBrokerPaged(Long brokerId, int page, int size) {
        List<BrokerMessageDTO> all = getAllMessagesByBroker(brokerId);
        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());
        return new PageImpl<>(all.subList(start, end), PageRequest.of(page, size), all.size());
    }

    @Transactional(readOnly = true)
    public List<BrokerMessageDTO> getUnreadMessages(Long brokerId) {
        return messageRepository.findByBrokerIdAndIsReadFalse(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BrokerMessageDTO getMessageById(Long brokerId, Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Message not found: " + messageId));
        if (msg.getBrokerId() != null && !brokerId.equals(msg.getBrokerId())) {
            throw new BrokerResourceNotFoundException("Message does not belong to this broker");
        }
        return mapToDTO(msg);
    }

    public BrokerMessageDTO markAsRead(Long brokerId, Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Message not found: " + messageId));
        msg.setIsRead(true);
        return mapToDTO(messageRepository.save(msg));
    }

    public void deleteMessage(Long brokerId, Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Message not found: " + messageId));
        messageRepository.delete(msg);
    }

    private BrokerMessageDTO mapToDTO(Message msg) {
        return BrokerMessageDTO.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .isRead(Boolean.TRUE.equals(msg.getIsRead()))
                .conversationId(msg.getConversation() != null ? msg.getConversation().getId() : null)
                .senderId(msg.getSender() != null ? msg.getSender().getId() : null)
                .receiverId(msg.getReceiver() != null ? msg.getReceiver().getId() : null)
                .brokerId(msg.getBrokerId())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
