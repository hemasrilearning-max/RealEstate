package com.realestate.modules.payment.dto.response;

import com.realestate.modules.payment.enums.PaymentMethod;
import com.realestate.modules.payment.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;

    private BigDecimal amount;

    private PaymentStatus status;

    private PaymentMethod paymentMethod;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private Long buyerId;

    private Long propertyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}