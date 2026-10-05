package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerReviewDTO;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.review.entity.Review;
import com.realestate.modules.review.enums.ReviewStatus;
import com.realestate.modules.review.repository.ReviewRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Uses existing reviews table + existing Review entity.
 * Requires broker_id column added to reviews table and Review entity.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BrokerReviewDTO createReview(Long brokerId, BrokerReviewDTO dto) {
        if (dto.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (dto.getPropertyId() == null) {
            throw new IllegalArgumentException("propertyId is required");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("User not found: " + dto.getUserId()));

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Property not found: " + dto.getPropertyId()));

        Review review = Review.builder()
                .user(user)
                .property(property)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .status(ReviewStatus.PENDING)
                .build();

        review.setBrokerId(brokerId);

        return mapToDTO(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<BrokerReviewDTO> getAllReviewsByBroker(Long brokerId) {
        return reviewRepository.findByBrokerId(brokerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrokerReviewDTO> getReviewsByBrokerPaged(Long brokerId, int page, int size) {
        List<BrokerReviewDTO> all = getAllReviewsByBroker(brokerId);
        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());
        return new PageImpl<>(all.subList(start, end), PageRequest.of(page, size), all.size());
    }

    @Transactional(readOnly = true)
    public BrokerReviewDTO getReviewById(Long brokerId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Review not found: " + reviewId));
        if (review.getBrokerId() != null && !brokerId.equals(review.getBrokerId())) {
            throw new BrokerResourceNotFoundException("Review does not belong to this broker");
        }
        return mapToDTO(review);
    }

    public BrokerReviewDTO updateReviewStatus(Long brokerId, Long reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Review not found: " + reviewId));
        review.setStatus(status);
        return mapToDTO(reviewRepository.save(review));
    }

    public void deleteReview(Long brokerId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Review not found: " + reviewId));
        reviewRepository.delete(review);
    }

    private BrokerReviewDTO mapToDTO(Review review) {
        return BrokerReviewDTO.builder()
                .id(review.getId())
                .comment(review.getComment())
                .rating(review.getRating())
                .status(review.getStatus())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .propertyId(review.getProperty() != null ? review.getProperty().getId() : null)
                .propertyTitle(review.getProperty() != null ? review.getProperty().getTitle() : null)
                .brokerId(review.getBrokerId())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
