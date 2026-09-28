package com.realestate.modules.messaging.mapper;

import com.realestate.modules.messaging.dto.response.ConversationResponse;
import com.realestate.modules.messaging.dto.response.MessageResponse;
import com.realestate.modules.messaging.entity.Conversation;
import com.realestate.modules.messaging.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessagingMapper {

  public ConversationResponse toConversationResponse(
      Conversation conversation) {

    return ConversationResponse.builder()
        .id(conversation.getId())

        .buyerId(conversation.getBuyer().getId())
        .buyerName(
            conversation.getBuyer().getFirstName()
                + " "
                + conversation.getBuyer().getLastName())

        .sellerId(conversation.getSeller().getId())
        .sellerName(
            conversation.getSeller().getFirstName()
                + " "
                + conversation.getSeller().getLastName())

        .propertyId(conversation.getProperty().getId())
        .propertyTitle(conversation.getProperty().getTitle())

        .createdAt(conversation.getCreatedAt())
        .build();
  }

  public MessageResponse toMessageResponse(Message message) {

    return MessageResponse.builder()
        .id(message.getId())

        .conversationId(
            message.getConversation().getId())

        .senderId(message.getSender().getId())
        .senderName(
            message.getSender().getFirstName()
                + " "
                + message.getSender().getLastName())

        .receiverId(message.getReceiver().getId())
        .receiverName(
            message.getReceiver().getFirstName()
                + " "
                + message.getReceiver().getLastName())

        .content(message.getContent())

        .isRead(message.getIsRead())

        .createdAt(message.getCreatedAt())
        .build();
  }
}