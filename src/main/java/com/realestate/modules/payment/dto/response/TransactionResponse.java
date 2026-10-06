package com.realestate.modules.payment.dto.response;

import com.realestate.modules.payment.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;

    private BigDecimal amount;

    private TransactionType transactionType;

    private Long paymentId;

    private Long propertyId;

    private Long buyerId;

    private Long brokerId;

    private BigDecimal brokerCommissionPercentage;

    private BigDecimal brokerCommissionAmount;

    private String transactionReference;

    private LocalDateTime createdAt;
}