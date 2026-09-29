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
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

  private final ReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final PropertyRepository propertyRepository;
  private final ReviewMapper reviewMapper;

  @Override
  public ReviewResponse createReview(CreateReviewRequest request) {

    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

    Property property = propertyRepository.findById(request.getPropertyId())
        .orElseThrow(() -> new RuntimeException("Property not found with ID: " + request.getPropertyId()));

    if (reviewRepository.findByUserIdAndPropertyId(
        request.getUserId(),
        request.getPropertyId()).isPresent()) {

      throw new RuntimeException(
          "User has already reviewed this property");
    }

    Review review = Review.builder()
        .user(user)
        .property(property)
        .rating(request.getRating())
        .comment(request.getComment())
        .status(ReviewStatus.PENDING)
        .build();

    Review savedReview = reviewRepository.save(review);

    return reviewMapper.toResponse(savedReview);
  }

  @Override
  @Transactional(readOnly = true)
  public ReviewResponse getReviewById(Long reviewId) {

    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

    return reviewMapper.toResponse(review);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ReviewResponse> getReviewsByProperty(Long propertyId) {

    return reviewRepository
        .findByPropertyIdOrderByCreatedAtDesc(propertyId)
        .stream()
        .map(reviewMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ReviewResponse> getReviewsByUser(Long userId) {

    return reviewRepository
        .findByUserIdOrderByCreatedAtDesc(userId)
        .stream()
        .map(reviewMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ReviewResponse> getReviewsByPropertyAndStatus(
      Long propertyId,
      ReviewStatus status) {

    return reviewRepository
        .findByPropertyIdAndStatusOrderByCreatedAtDesc(
            propertyId,
            status)
        .stream()
        .map(reviewMapper::toResponse)
        .toList();
  }

  @Override
  public ReviewResponse updateReview(
      Long reviewId,
      UpdateReviewRequest request) {

    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

    review.setRating(request.getRating());
    review.setComment(request.getComment());

    Review updatedReview = reviewRepository.save(review);

    return reviewMapper.toResponse(updatedReview);
  }

  @Override
  public void updateReviewStatus(
      Long reviewId,
      ReviewStatus status) {

    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

    review.setStatus(status);

    reviewRepository.save(review);
  }

  @Override
  public void deleteReview(Long reviewId) {

    Review review = reviewRepository.findById(reviewId)
        .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

    reviewRepository.delete(review);
  }
}