package com.realestate.modules.tour.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTourRequest {

  @FutureOrPresent(message = "Tour date must be today or a future date")
  private LocalDate tourDate;

  private LocalTime tourTime;

  @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
  private String notes;
}