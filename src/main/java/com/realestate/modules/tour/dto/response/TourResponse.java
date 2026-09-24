package com.realestate.modules.tour.dto.response;

import com.realestate.modules.tour.enums.TourStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourResponse {

  private Long id;

  private Long propertyId;
  private String propertyTitle;

  private Long buyerId;
  private String buyerName;

  private LocalDate tourDate;
  private LocalTime tourTime;

  private TourStatus status;

  private String notes;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}