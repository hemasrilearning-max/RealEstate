package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerMessageDTO;
import com.realestate.modules.Broker.service.BrokerMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                        "Message created",
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
