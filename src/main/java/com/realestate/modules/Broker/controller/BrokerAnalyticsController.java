package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerAnalyticsDTO;
import com.realestate.modules.Broker.service.BrokerAnalyticsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/broker/analytics")
@RequiredArgsConstructor
public class BrokerAnalyticsController {

    private final BrokerAnalyticsService analyticsService;

    /**
     * Get analytics for a specific broker.
     *
     * GET /api/broker/analytics/{brokerId}
     */
    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerAnalyticsDTO> getBrokerAnalytics(
            @PathVariable Long brokerId
    ) {

        BrokerAnalyticsDTO analytics =
                analyticsService.getBrokerAnalytics(
                        brokerId
                );

        return ResponseEntity.ok(analytics);
    }
}