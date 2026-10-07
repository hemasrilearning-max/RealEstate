package com.realestate.modules.payment.controller;

import com.realestate.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentRepository paymentRepository;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(
                    value = "X-Razorpay-Signature",
                    required = false
            ) String signature) {

        if (signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Webhook signature is missing");
        }

        boolean validSignature = verifyWebhookSignature(
                payload,
                signature
        );

        if (!validSignature) {
            return ResponseEntity.badRequest()
                    .body("Invalid webhook signature");
        }

        /*
         * Razorpay webhook signature is valid.
         *
         * Actual event processing will be added after
         * the main payment flow is tested successfully.
         */

        return ResponseEntity.ok("Webhook received");
    }

    private boolean verifyWebhookSignature(
            String payload,
            String signature) {

        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(secretKey);

            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8)
            );

            StringBuilder generatedSignature =
                    new StringBuilder();

            for (byte b : hash) {
                generatedSignature.append(
                        String.format("%02x", b)
                );
            }

            return generatedSignature
                    .toString()
                    .equals(signature);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to verify Razorpay webhook signature",
                    e
            );
        }
    }
}