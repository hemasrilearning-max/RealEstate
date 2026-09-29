package com.realestate.modules.review.dto.response;

import com.realestate.modules.review.enums.ReviewStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

  private Long id;

  private Long userId;
  private String userName;

  private Long propertyId;
  private String propertyTitle;

  private Integer rating;
  private String comment;

  private ReviewStatus status;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}