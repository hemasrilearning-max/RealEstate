package com.realestate.modules.review.mapper;

import com.realestate.modules.review.dto.response.ReviewResponse;
import com.realestate.modules.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

  public ReviewResponse toResponse(Review review) {

    return ReviewResponse.builder()
        .id(review.getId())

        .userId(review.getUser().getId())
        .userName(
            review.getUser().getFirstName()
                + " "
                + review.getUser().getLastName())

        .propertyId(review.getProperty().getId())
        .propertyTitle(review.getProperty().getTitle())

        .rating(review.getRating())
        .comment(review.getComment())
        .status(review.getStatus())

        .createdAt(review.getCreatedAt())
        .updatedAt(review.getUpdatedAt())

        .build();
  }
}