package com.realestate.modules.Broker.dto;

import com.realestate.modules.review.enums.ReviewStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerReviewDTO {

    private Long id;

    private String comment;

    private Integer rating;

    private ReviewStatus status;

    /** users.id of the reviewer */
    private Long userId;

    /** properties.id */
    private Long propertyId;

    private String propertyTitle;

    /** users.id of the BROKER */
    private Long brokerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
