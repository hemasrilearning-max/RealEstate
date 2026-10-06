package com.realestate.modules.payment.controller;

import com.realestate.modules.payment.dto.request.RefundRequest;
import com.realestate.modules.payment.entity.Refund;
import com.realestate.modules.payment.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public ResponseEntity<Refund> createRefund(
            @Valid @RequestBody RefundRequest request) {

        Refund refund = refundService.createRefund(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(refund);
    }

    @GetMapping("/{refundId}")
    public ResponseEntity<Refund> getRefundById(
            @PathVariable Long refundId) {

        return ResponseEntity.ok(
                refundService.getRefundById(refundId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<Refund>> getMyRefunds() {

        return ResponseEntity.ok(
                refundService.getMyRefunds()
        );
    }
}