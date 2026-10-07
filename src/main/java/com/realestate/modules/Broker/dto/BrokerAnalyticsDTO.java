package com.realestate.modules.Broker.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerAnalyticsDTO {

    private Long brokerId;

    private long totalProperties;

    private long activeListings;

    private long totalLeads;

    private double conversionRate;

    private long closedDeals;

    private long totalTours;

    private long totalClients;

    private BigDecimal totalCommission;

    private Map<String, Long> propertiesByType;

    private Map<String, Long> leadsByStatus;

    private Map<String, Long> buyVsRent;
}