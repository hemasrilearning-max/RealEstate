package com.realestate.modules.Broker.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerLeadDTO {

    private Long id;

    private Long buyerId;
    private String buyerName;

    private Long propertyId;
    private String propertyTitle;

    private Long sellerId;
    private String sellerName;

    private Long brokerId;

    private String name;
    private String email;
    private String phone;
    private String message;

    /** NEW, CONTACTED, IN_PROGRESS, CONVERTED, CLOSED */
    private String status;

    private LocalDateTime createdAt;
}
