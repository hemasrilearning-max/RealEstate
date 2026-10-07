package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerMessageDTO;
import com.realestate.modules.Broker.dto.BrokerMessageRequestDTO;
import com.realestate.modules.Broker.service.BrokerMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Broker conversation APIs – same idea as owner conversations.
 * Backed by conversations table; broker sees requests on their properties.
 *
 * Base: /api/broker/conversations
 */
@RestController
@RequestMapping("/api/broker/conversations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerConversationController {

    private final BrokerMessageService messageService;

    /**
     * List all message requests / conversations for this broker
     * (PENDING + ACCEPTED on properties assigned to the broker).
     *
     * GET /api/broker/conversations/{brokerId}
     */
    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageRequestDTO>>> list(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessageRequests(brokerId)
                )
        );
    }

    /**
     * Pending only
     * GET /api/broker/conversations/{brokerId}/pending
     */
    @GetMapping("/{brokerId}/pending")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageRequestDTO>>> pending(
            @PathVariable Long brokerId) {

        List<BrokerMessageRequestDTO> all =
                messageService.getMessageRequests(brokerId);

        List<BrokerMessageRequestDTO> pending = all.stream()
                .filter(r -> "PENDING".equalsIgnoreCase(
                        r.getStatus() != null ? r.getStatus() : "PENDING"))
                .toList();

        return ResponseEntity.ok(BrokerApiResponse.success(pending));
    }

    /**
     * Accept request (first of owner/broker wins)
     * POST /api/broker/conversations/{brokerId}/{conversationId}/accept
     */
    @PostMapping("/{brokerId}/{conversationId}/accept")
    public ResponseEntity<BrokerApiResponse<BrokerMessageRequestDTO>> accept(
            @PathVariable Long brokerId,
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Request accepted",
                        messageService.acceptMessageRequest(brokerId, conversationId)
                )
        );
    }

    /**
     * Reject request
     * POST /api/broker/conversations/{brokerId}/{conversationId}/reject
     */
    @PostMapping("/{brokerId}/{conversationId}/reject")
    public ResponseEntity<BrokerApiResponse<BrokerMessageRequestDTO>> reject(
            @PathVariable Long brokerId,
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Request rejected",
                        messageService.rejectMessageRequest(brokerId, conversationId)
                )
        );
    }

    /**
     * Messages inside a conversation
     * GET /api/broker/conversations/{brokerId}/{conversationId}/messages
     */
    @GetMapping("/{brokerId}/{conversationId}/messages")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> messages(
            @PathVariable Long brokerId,
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessagesByConversation(brokerId, conversationId)
                )
        );
    }
}
