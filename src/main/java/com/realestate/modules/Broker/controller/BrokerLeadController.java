package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerLeadDTO;
import com.realestate.modules.Broker.service.BrokerLeadService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/broker/leads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerLeadController {

    private final BrokerLeadService leadService;

    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerLeadDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerLeadDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BrokerApiResponse.success(
                        "Lead created",
                        leadService.createLead(brokerId, dto)));
    }

    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerLeadDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        leadService.getAllLeadsByBroker(brokerId)));
    }

    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerLeadDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        leadService.getLeadsByBrokerPaged(brokerId, page, size)));
    }

    @GetMapping("/{brokerId}/{leadId}")
    public ResponseEntity<BrokerApiResponse<BrokerLeadDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long leadId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        leadService.getLeadById(brokerId, leadId)));
    }

    @PutMapping("/{brokerId}/{leadId}")
    public ResponseEntity<BrokerApiResponse<BrokerLeadDTO>> update(
            @PathVariable Long brokerId,
            @PathVariable Long leadId,
            @RequestBody BrokerLeadDTO dto) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Lead updated",
                        leadService.updateLead(brokerId, leadId, dto)));
    }

    /**
     * PATCH body: { "status": "CONTACTED" }
     * or query: ?status=CONTACTED
     */
    @PatchMapping("/{brokerId}/{leadId}/status")
    public ResponseEntity<BrokerApiResponse<BrokerLeadDTO>> updateStatus(
            @PathVariable Long brokerId,
            @PathVariable Long leadId,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> body) {

        String value = status;
        if ((value == null || value.isBlank()) && body != null) {
            value = body.get("status");
        }

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Lead status updated",
                        leadService.updateLeadStatus(brokerId, leadId, value)));
    }

    @DeleteMapping("/{brokerId}/{leadId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long leadId) {

        leadService.deleteLead(brokerId, leadId);

        return ResponseEntity.ok(
                BrokerApiResponse.success("Lead deleted", null));
    }
}
