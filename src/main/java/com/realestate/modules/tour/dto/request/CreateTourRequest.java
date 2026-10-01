package com.realestate.modules.tour.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTourRequest {

  @NotNull(message = "Property ID is required")
  private Long propertyId;

  @NotNull(message = "Tour date is required")
  @FutureOrPresent(message = "Tour date must be today or a future date")
  private LocalDate tourDate;

  @NotNull(message = "Tour time is required")
  private LocalTime tourTime;

  @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
  private String notes;
}