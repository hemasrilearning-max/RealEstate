package com.realestate.modules.payment.controller;

import com.realestate.modules.payment.dto.request.CreatePaymentRequest;
import com.realestate.modules.payment.dto.request.VerifyPaymentRequest;
import com.realestate.modules.payment.dto.response.PaymentResponse;
import com.realestate.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {

        PaymentResponse response =
                paymentService.verifyPayment(request);

        return ResponseEntity.ok(response);
    }

    /*
     * Admin payment list.
     *
     * Only ADMIN and SUPER_ADMIN users are allowed.
     */
    @GetMapping("/admin")
    public ResponseEntity<List<PaymentResponse>> getAllPaymentsForAdmin() {

        return ResponseEntity.ok(
                paymentService.getAllPaymentsForAdmin()
        );
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(paymentId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {

        return ResponseEntity.ok(
                paymentService.getMyPayments()
        );
    }
}
