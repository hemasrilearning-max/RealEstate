package com.realestate.modules.payment.gateway;

import java.math.BigDecimal;

public interface PaymentGateway {

    String createOrder(BigDecimal amount, String receipt);

    boolean verifyPaymentSignature(
            String orderId,
            String paymentId,
            String signature
    );

    String createRefund(
            String paymentId,
            BigDecimal amount,
            String reason
    );
}