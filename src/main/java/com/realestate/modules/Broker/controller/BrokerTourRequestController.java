package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerTourRequestDTO;

import com.realestate.modules.Broker.service.BrokerTourRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/broker/tours")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerTourRequestController {

    private final BrokerTourRequestService tourRequestService;

    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerTourRequestDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerTourRequestDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BrokerApiResponse.success(
                        "Tour request created",
                        tourRequestService.createTourRequest(brokerId, dto)
                ));
    }

    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerTourRequestDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        tourRequestService.getAllTourRequestsByBroker(brokerId)
                )
        );
    }

    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerTourRequestDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        tourRequestService.getTourRequestsByBrokerPaged(brokerId, page, size)
                )
        );
    }

    @GetMapping("/{brokerId}/pending")
    public ResponseEntity<BrokerApiResponse<List<BrokerTourRequestDTO>>> getPending(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        tourRequestService.getPendingTours(brokerId)
                )
        );
    }

    @GetMapping("/{brokerId}/{tourId}")
    public ResponseEntity<BrokerApiResponse<BrokerTourRequestDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long tourId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        tourRequestService.getTourRequestById(brokerId, tourId)
                )
        );
    }

    @PutMapping("/{brokerId}/{tourId}")
    public ResponseEntity<BrokerApiResponse<BrokerTourRequestDTO>> update(
            @PathVariable Long brokerId,
            @PathVariable Long tourId,
            @RequestBody BrokerTourRequestDTO dto) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Tour request updated",
                        tourRequestService.updateTourRequest(brokerId, tourId, dto)
                )
        );
    }

    @PatchMapping("/{brokerId}/{tourId}/status")
    public ResponseEntity<BrokerApiResponse<BrokerTourRequestDTO>> updateStatus(
            @PathVariable Long brokerId,
            @PathVariable Long tourId,
            @RequestBody Map<String, String> body) {

        com.realestate.modules.tour.enums.TourStatus status =
                com.realestate.modules.tour.enums.TourStatus.valueOf(body.get("status").toUpperCase());

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Status updated",
                        tourRequestService.updateTourStatus(brokerId, tourId, status)
                )
        );
    }

    @DeleteMapping("/{brokerId}/{tourId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long tourId) {

        tourRequestService.deleteTourRequest(brokerId, tourId);
        return ResponseEntity.ok(
                BrokerApiResponse.success("Tour request deleted", null)
        );
    }
}
