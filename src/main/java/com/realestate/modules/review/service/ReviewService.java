package com.realestate.modules.review.service;

import com.realestate.modules.review.dto.request.CreateReviewRequest;
import com.realestate.modules.review.dto.request.UpdateReviewRequest;
import com.realestate.modules.review.dto.response.ReviewResponse;
import com.realestate.modules.review.enums.ReviewStatus;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getReviewById(Long reviewId);

    List<ReviewResponse> getAllReviews();

    List<ReviewResponse> getReviewsByProperty(Long propertyId);

    List<ReviewResponse> getMyReviews();

    List<ReviewResponse> getReviewsByPropertyAndStatus(
            Long propertyId,
            ReviewStatus status);

    ReviewResponse updateReview(
            Long reviewId,
            UpdateReviewRequest request);

    void updateReviewStatus(
            Long reviewId,
            ReviewStatus status);

    void deleteReview(Long reviewId);
}