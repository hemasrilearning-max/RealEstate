package com.realestate.modules.payment.gateway;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
public class RazorpayService implements PaymentGateway {

    private final RazorpayClient razorpayClient;

    private final String keySecret;

    public RazorpayService(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret
    ) throws Exception {

        this.razorpayClient = new RazorpayClient(keyId, keySecret);
        this.keySecret = keySecret;
    }

    @Override
    public String createOrder(BigDecimal amount, String receipt) {

        try {
            long amountInPaise = amount
                    .multiply(BigDecimal.valueOf(100))
                    .longValueExact();

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);

            Order order = razorpayClient.orders.create(orderRequest);

            return order.get("id");

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to create Razorpay order: " + e.getMessage(),
                    e
            );
        }
    }

    @Override
    public boolean verifyPaymentSignature(
            String orderId,
            String paymentId,
            String signature
    ) {

        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(secretKey);

            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8)
            );

            StringBuilder generatedSignature = new StringBuilder();

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
                    "Failed to verify Razorpay payment signature",
                    e
            );
        }
    }

    @Override
    public String createRefund(
            String paymentId,
            BigDecimal amount,
            String reason
    ) {

        try {
            long amountInPaise = amount
                    .multiply(BigDecimal.valueOf(100))
                    .longValueExact();

            JSONObject refundRequest = new JSONObject();

            refundRequest.put("amount", amountInPaise);

            if (reason != null && !reason.isBlank()) {
                refundRequest.put("notes", reason);
            }

            Refund refund = razorpayClient
                    .payments
                    .refund(paymentId, refundRequest);

            return refund.get("id");

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to create Razorpay refund: " + e.getMessage(),
                    e
            );
        }
    }
}