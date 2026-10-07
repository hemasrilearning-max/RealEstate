
package com.realestate.modules.Broker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrokerDashboardStatsDTO {

    private long totalProperties;

    private long activeLeads;

    private long unreadMessages;

    private long pendingTours;

    private long totalViews;

    private long closedDeals;

    private double conversionRate;
}

