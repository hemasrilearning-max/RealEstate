package com.realestate.modules.Broker.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * A pending (or accepted) message request from a buyer on a property.
 * Same shared conversation the owner sees.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerMessageRequestDTO {

    private Long conversationId;

    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;

    private Long sellerId;
    private String sellerName;

    private Long propertyId;
    private String propertyTitle;

    private Long brokerId;

    /** PENDING | ACCEPTED | REJECTED */
    private String status;

    private LocalDateTime createdAt;

    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
