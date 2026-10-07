package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerMessageDTO;
import com.realestate.modules.Broker.dto.BrokerMessageRequestDTO;
import com.realestate.modules.Broker.service.BrokerMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Broker Messages – same messaging tables, clear BUYER vs OWNER chats.
 *
 * POST body examples:
 *
 * To BUYER:
 * {
 *   "recipientType": "BUYER",
 *   "receiverId": 15,
 *   "propertyId": 5,
 *   "content": "Your visit is confirmed"
 * }
 *
 * To OWNER:
 * {
 *   "recipientType": "OWNER",
 *   "propertyId": 5,
 *   "content": "Client is ready to close"
 * }
 */
@RestController
@RequestMapping("/api/broker/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerMessageController {

    private final BrokerMessageService messageService;

    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerMessageDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerMessageDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BrokerApiResponse.success(
                        "Message sent",
                        messageService.createMessage(brokerId, dto)
                ));
    }

    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getAllMessagesByBroker(brokerId)
                )
        );
    }

    /** Filter: ?recipientType=BUYER or ?recipientType=OWNER */
    @GetMapping("/{brokerId}/by-type")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> getByType(
            @PathVariable Long brokerId,
            @RequestParam String recipientType) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessagesByRecipientType(brokerId, recipientType)
                )
        );
    }

    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerMessageDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessagesByBrokerPaged(brokerId, page, size)
                )
        );
    }

    @GetMapping("/{brokerId}/unread")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> getUnread(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getUnreadMessages(brokerId)
                )
        );
    }

    @GetMapping("/{brokerId}/property/{propertyId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> getByProperty(
            @PathVariable Long brokerId,
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessagesByProperty(brokerId, propertyId)
                )
        );
    }

    /**
     * Get messages by conversation
     * GET /api/broker/messages/{brokerId}/conversation/{conversationId}
     */
    @GetMapping("/{brokerId}/conversation/{conversationId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageDTO>>> getByConversation(
            @PathVariable Long brokerId,
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessagesByConversation(brokerId, conversationId)
                )
        );
    }


    /**
     * List message requests (pending + accepted) for broker properties.
     * GET /api/broker/messages/{brokerId}/requests
     */
    @GetMapping("/{brokerId}/requests")
    public ResponseEntity<BrokerApiResponse<List<BrokerMessageRequestDTO>>> getRequests(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessageRequests(brokerId)
                )
        );
    }

    /**
     * Accept message request (broker accepts – same as owner accept).
     * POST /api/broker/messages/{brokerId}/requests/{conversationId}/accept
     */
    @PostMapping("/{brokerId}/requests/{conversationId}/accept")
    public ResponseEntity<BrokerApiResponse<BrokerMessageRequestDTO>> acceptRequest(
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
     * Reject message request
     * POST /api/broker/messages/{brokerId}/requests/{conversationId}/reject
     */
    @PostMapping("/{brokerId}/requests/{conversationId}/reject")
    public ResponseEntity<BrokerApiResponse<BrokerMessageRequestDTO>> rejectRequest(
            @PathVariable Long brokerId,
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Request rejected",
                        messageService.rejectMessageRequest(brokerId, conversationId)
                )
        );
    }

    @GetMapping("/{brokerId}/{messageId}")
    public ResponseEntity<BrokerApiResponse<BrokerMessageDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long messageId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        messageService.getMessageById(brokerId, messageId)
                )
        );
    }

    @PatchMapping("/{brokerId}/{messageId}/read")
    public ResponseEntity<BrokerApiResponse<BrokerMessageDTO>> markAsRead(
            @PathVariable Long brokerId,
            @PathVariable Long messageId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Marked as read",
                        messageService.markAsRead(brokerId, messageId)
                )
        );
    }

    @DeleteMapping("/{brokerId}/{messageId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long messageId) {

        messageService.deleteMessage(brokerId, messageId);
        return ResponseEntity.ok(
                BrokerApiResponse.success("Message deleted", null)
        );
    }
}
