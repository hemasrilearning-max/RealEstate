package com.realestate.modules.Broker.dto;

import com.realestate.modules.Broker.entity.BrokerLead.LeadSource;
import com.realestate.modules.Broker.entity.BrokerLead.LeadStatus;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerLeadDTO {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String message;

    private LeadStatus status;

    private LeadSource source;

    /**
     * properties.id
     */
    private Long propertyId;

    private String propertyTitle;

    /**
     * users.id where the user has BROKER role.
     */
    private Long brokerId;

    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}