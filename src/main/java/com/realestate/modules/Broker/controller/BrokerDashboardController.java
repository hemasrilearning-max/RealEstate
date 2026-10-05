package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerDashboardStatsDTO;
import com.realestate.modules.Broker.dto.BrokerLeadDTO;
import com.realestate.modules.Broker.service.BrokerDashboardService;
import com.realestate.modules.Broker.service.BrokerLeadService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * brokerId path variable = users.id where role = BROKER
 *
 * Example:
 * user id 9 (hemasri) is a BROKER
 */
@RestController
@RequestMapping("/api/broker/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerDashboardController {

    private final BrokerDashboardService dashboardService;

    private final BrokerLeadService leadService;

    /**
     * Get dashboard statistics for a broker.
     *
     * Example:
     * GET /api/broker/dashboard/stats/9
     */
    @GetMapping("/stats/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerDashboardStatsDTO>> getStats(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Dashboard stats retrieved",
                        dashboardService.getDashboardStats(brokerId)
                )
        );
    }

    /**
     * Get recent leads for a broker.
     *
     * Example:
     * GET /api/broker/dashboard/recent-leads/9?limit=5
     */
    @GetMapping("/recent-leads/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerLeadDTO>>> getRecentLeads(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        leadService.getRecentLeads(brokerId, limit)
                )
        );
    }
}

