package com.realestate.modules.messaging.service;

import com.realestate.modules.messaging.dto.request.CreateConversationRequest;
import com.realestate.modules.messaging.dto.request.SendMessageRequest;
import com.realestate.modules.messaging.dto.response.ConversationResponse;
import com.realestate.modules.messaging.dto.response.MessageResponse;

import java.util.List;

public interface MessagingService {

  ConversationResponse createConversation(
      CreateConversationRequest request);

  ConversationResponse getConversationById(
      Long conversationId);

  List<ConversationResponse> getBuyerConversations(
      Long buyerId);

  List<ConversationResponse> getSellerConversations(
      Long sellerId);

  List<ConversationResponse> getPropertyConversations(
      Long propertyId);

  MessageResponse sendMessage(
      Long conversationId,
      SendMessageRequest request);

  List<MessageResponse> getConversationMessages(
      Long conversationId);

  void markMessageAsRead(
      Long messageId);

  List<MessageResponse> getUnreadMessages(
      Long receiverId);

  long getUnreadMessageCount(
      Long receiverId);

  void deleteMessage(
      Long messageId);
}