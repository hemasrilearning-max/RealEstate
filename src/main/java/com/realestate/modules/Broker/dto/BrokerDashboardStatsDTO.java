package com.realestate.modules.Broker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerDashboardStatsDTO {
    private long totalProperties;
    private long activeLeads;
    private long unreadMessages;
    private long pendingTours;
    private long totalViews;
    private long closedDeals;
}
