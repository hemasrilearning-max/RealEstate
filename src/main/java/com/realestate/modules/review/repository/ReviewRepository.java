package com.realestate.modules.review.repository;

import com.realestate.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

  List<Review> findByPropertyIdOrderByCreatedAtDesc(
      Long propertyId);

  List<Review> findByUserIdOrderByCreatedAtDesc(
      Long userId);

  Optional<Review> findByUserIdAndPropertyId(
      Long userId,
      Long propertyId);

  List<Review> findByPropertyIdAndStatusOrderByCreatedAtDesc(
      Long propertyId,
      com.realestate.modules.review.enums.ReviewStatus status);
}