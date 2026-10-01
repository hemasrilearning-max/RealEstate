package com.realestate.modules.messaging.controller;

import com.realestate.modules.messaging.dto.request.CreateConversationRequest;
import com.realestate.modules.messaging.dto.request.SendMessageRequest;
import com.realestate.modules.messaging.dto.response.ConversationResponse;
import com.realestate.modules.messaging.dto.response.MessageResponse;
import com.realestate.modules.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messaging")
@RequiredArgsConstructor
public class MessageController {

    private final MessagingService messagingService;

    // ============================================================
    // CONVERSATION APIs
    // ============================================================

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @Valid @RequestBody CreateConversationRequest request) {

        ConversationResponse response = messagingService.createConversation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                messagingService.getConversationById(conversationId));
    }

    @GetMapping("/conversations/buyer/{buyerId}")
    public ResponseEntity<List<ConversationResponse>> getBuyerConversations(
            @PathVariable Long buyerId) {

        return ResponseEntity.ok(
                messagingService.getBuyerConversations(buyerId));
    }

    @GetMapping("/conversations/seller/{sellerId}")
    public ResponseEntity<List<ConversationResponse>> getSellerConversations(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                messagingService.getSellerConversations(sellerId));
    }

    @GetMapping("/conversations/property/{propertyId}")
    public ResponseEntity<List<ConversationResponse>> getPropertyConversations(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                messagingService.getPropertyConversations(propertyId));
    }

    // ============================================================
    // MESSAGE APIs
    // ============================================================

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {

        MessageResponse response = messagingService.sendMessage(
                conversationId,
                request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                messagingService.getConversationMessages(
                        conversationId));
    }

    @PatchMapping("/messages/{messageId}/read")
    public ResponseEntity<String> markMessageAsRead(
            @PathVariable Long messageId) {

        messagingService.markMessageAsRead(messageId);

        return ResponseEntity.ok(
                "Message marked as read");
    }

    @GetMapping("/messages/unread/{receiverId}")
    public ResponseEntity<List<MessageResponse>> getUnreadMessages(
            @PathVariable Long receiverId) {

        return ResponseEntity.ok(
                messagingService.getUnreadMessages(receiverId));
    }

    @GetMapping("/messages/unread/{receiverId}/count")
    public ResponseEntity<Long> getUnreadMessageCount(
            @PathVariable Long receiverId) {

        return ResponseEntity.ok(
                messagingService.getUnreadMessageCount(receiverId));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable Long messageId) {

        messagingService.deleteMessage(messageId);

        return ResponseEntity.ok(
                "Message deleted successfully");
    }
}