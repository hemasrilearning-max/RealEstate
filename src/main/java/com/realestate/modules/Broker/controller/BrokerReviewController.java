package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.dto.BrokerReviewDTO;

import com.realestate.modules.Broker.service.BrokerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/broker/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerReviewController {

    private final BrokerReviewService reviewService;

    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<BrokerReviewDTO>> create(
            @PathVariable Long brokerId,
            @RequestBody BrokerReviewDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BrokerApiResponse.success(
                        "Review created",
                        reviewService.createReview(brokerId, dto)
                ));
    }

    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<BrokerReviewDTO>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        reviewService.getAllReviewsByBroker(brokerId)
                )
        );
    }

    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<BrokerReviewDTO>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        reviewService.getReviewsByBrokerPaged(brokerId, page, size)
                )
        );
    }

    @GetMapping("/{brokerId}/{reviewId}")
    public ResponseEntity<BrokerApiResponse<BrokerReviewDTO>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        reviewService.getReviewById(brokerId, reviewId)
                )
        );
    }

    @PatchMapping("/{brokerId}/{reviewId}/status")
    public ResponseEntity<BrokerApiResponse<BrokerReviewDTO>> updateStatus(
            @PathVariable Long brokerId,
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body) {

        com.realestate.modules.review.enums.ReviewStatus status =
                com.realestate.modules.review.enums.ReviewStatus.valueOf(body.get("status").toUpperCase());

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Status updated",
                        reviewService.updateReviewStatus(brokerId, reviewId, status)
                )
        );
    }

    @DeleteMapping("/{brokerId}/{reviewId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long reviewId) {

        reviewService.deleteReview(brokerId, reviewId);
        return ResponseEntity.ok(
                BrokerApiResponse.success("Review deleted", null)
        );
    }
}
