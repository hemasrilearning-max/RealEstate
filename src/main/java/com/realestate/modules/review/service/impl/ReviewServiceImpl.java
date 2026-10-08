package com.realestate.modules.review.service.impl;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.review.dto.request.CreateReviewRequest;
import com.realestate.modules.review.dto.request.UpdateReviewRequest;
import com.realestate.modules.review.dto.response.ReviewResponse;
import com.realestate.modules.review.entity.Review;
import com.realestate.modules.review.enums.ReviewStatus;
import com.realestate.modules.review.mapper.ReviewMapper;
import com.realestate.modules.review.repository.ReviewRepository;
import com.realestate.modules.review.service.ReviewService;
import com.realestate.modules.user.entity.User;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewMapper reviewMapper;
    private final AuthenticatedUserService authenticatedUserService;

    /**
     * Create a property review.
     *
     * The reviewer is taken from the currently authenticated JWT user.
     */
    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {

        User currentUser = authenticatedUserService.getCurrentUser();

        Property property = propertyRepository.findById(
                request.getPropertyId()
        ).orElseThrow(
                () -> new RuntimeException(
                        "Property not found with ID: "
                                + request.getPropertyId()
                )
        );

        /*
         * One user can review a property only once.
         */
        if (reviewRepository.findByUserIdAndPropertyId(
                currentUser.getId(),
                property.getId()
        ).isPresent()) {

            throw new RuntimeException(
                    "You have already reviewed this property"
            );
        }

        Review review = Review.builder()
                .user(currentUser)
                .property(property)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING)
                .build();

        Review savedReview = reviewRepository.save(review);

        return reviewMapper.toResponse(savedReview);
    }

    /**
     * Get a review by ID.
     */
    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Review not found with ID: "
                                + reviewId
                ));

        return reviewMapper.toResponse(review);
    }

    /**
     * Get all reviews.
     *
     * Used by the Admin Reviews page.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    /**
     * Get all reviews for a property.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProperty(
            Long propertyId) {

        return reviewRepository
                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    /**
     * Get reviews created by the currently authenticated user.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews() {

        User currentUser = authenticatedUserService.getCurrentUser();

        return reviewRepository
                .findByUserIdOrderByCreatedAtDesc(
                        currentUser.getId()
                )
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    /**
     * Get reviews for a property filtered by status.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByPropertyAndStatus(
            Long propertyId,
            ReviewStatus status) {

        return reviewRepository
                .findByPropertyIdAndStatusOrderByCreatedAtDesc(
                        propertyId,
                        status
                )
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    /**
     * Update only the review created by the current user.
     */
    @Override
    public ReviewResponse updateReview(
            Long reviewId,
            UpdateReviewRequest request) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Review not found with ID: "
                                + reviewId
                ));

        validateReviewOwnership(review);

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);

        return reviewMapper.toResponse(updatedReview);
    }

    /**
     * Update review moderation status.
     */
    @Override
    public void updateReviewStatus(
            Long reviewId,
            ReviewStatus status) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Review not found with ID: "
                                + reviewId
                ));

        review.setStatus(status);

        reviewRepository.save(review);
    }

    /**
     * Delete only the review created by the current user.
     */
    @Override
    public void deleteReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Review not found with ID: "
                                + reviewId
                ));

        validateReviewOwnership(review);

        reviewRepository.delete(review);
    }

    /**
     * Makes sure that only the review owner can modify/delete
     * the review.
     */
    private void validateReviewOwnership(Review review) {

        User currentUser = authenticatedUserService.getCurrentUser();

        if (!currentUser.getId().equals(
                review.getUser().getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to modify this review"
            );
        }
    }
}