package com.realestate.modules.Broker.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerMessageDTO {

    private Long id;
    private String content;
    private boolean isRead;

    private Long senderId;
    private String senderName;
    /** BUYER | SELLER | BROKER */
    private String senderRole;

    private Long receiverId;
    private String receiverName;

    private Long propertyId;
    private String propertyTitle;

    private Long brokerId;

    /**
     * BUYER = shared chat with real buyer
     * OWNER = private broker–owner chat
     */
    private String recipientType;

    private Long conversationId;
    private String conversationStatus;

    /** Real buyer on shared conversation (never the broker) */
    private Long buyerId;
    private String buyerName;

    /** Property owner / seller */
    private Long sellerId;
    private String sellerName;

    private LocalDateTime createdAt;
}
