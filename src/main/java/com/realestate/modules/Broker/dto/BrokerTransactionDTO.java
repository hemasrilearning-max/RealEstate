package com.realestate.modules.Broker.dto;

import com.realestate.modules.Broker.entity.BrokerTransaction.TransactionStatus;
import com.realestate.modules.Broker.entity.BrokerTransaction.TransactionType;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerTransactionDTO {

    private Long id;

    private String transactionCode;

    private BigDecimal amount;

    private TransactionType type;

    private TransactionStatus status;

    private LocalDateTime closingDate;

    /** properties.id */
    private Long propertyId;

    private String propertyTitle;

    private Long clientId;

    private String clientName;

    /** users.id where the user has BROKER role. */
    private Long brokerId;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}