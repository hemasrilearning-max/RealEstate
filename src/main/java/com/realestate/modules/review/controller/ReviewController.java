package com.realestate.modules.review.controller;

import com.realestate.modules.review.dto.request.CreateReviewRequest;
import com.realestate.modules.review.dto.request.UpdateReviewRequest;
import com.realestate.modules.review.dto.response.ReviewResponse;
import com.realestate.modules.review.enums.ReviewStatus;
import com.realestate.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a review for a property.
     * The reviewer is taken from the JWT authenticated user.
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request) {

        ReviewResponse response = reviewService.createReview(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Get review by ID.
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReviewById(
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                reviewService.getReviewById(reviewId));
    }

    /**
     * Get all reviews for a property.
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProperty(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByProperty(propertyId));
    }

    /**
     * Get reviews written by the currently authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {

        return ResponseEntity.ok(
                reviewService.getMyReviews());
    }

    /**
     * Get reviews for a property by status.
     */
    @GetMapping("/property/{propertyId}/status/{status}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByPropertyAndStatus(
            @PathVariable Long propertyId,
            @PathVariable ReviewStatus status) {

        return ResponseEntity.ok(
                reviewService.getReviewsByPropertyAndStatus(
                        propertyId,
                        status));
    }

    /**
     * Update own review.
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {

        return ResponseEntity.ok(
                reviewService.updateReview(
                        reviewId,
                        request));
    }

    /**
     * Update review status.
     *
     * This is intended for administrative/moderation functionality.
     */
    @PatchMapping("/{reviewId}/status")
    public ResponseEntity<String> updateReviewStatus(
            @PathVariable Long reviewId,
            @RequestParam ReviewStatus status) {

        reviewService.updateReviewStatus(
                reviewId,
                status);

        return ResponseEntity.ok(
                "Review status updated successfully");
    }

    /**
     * Delete own review.
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(
            @PathVariable Long reviewId) {

        reviewService.deleteReview(reviewId);

        return ResponseEntity.ok(
                "Review deleted successfully");
    }
}