package com.realestate.modules.location.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLocationRequest {

  @NotBlank(message = "Country is required")
  @Size(max = 100, message = "Country must not exceed 100 characters")
  private String country;

  @NotBlank(message = "State is required")
  @Size(max = 100, message = "State must not exceed 100 characters")
  private String state;

  @NotBlank(message = "City is required")
  @Size(max = 100, message = "City must not exceed 100 characters")
  private String city;

  @Size(max = 100, message = "Area must not exceed 100 characters")
  private String area;

  @Size(max = 20, message = "Pincode must not exceed 20 characters")
  private String pincode;

  @Size(max = 500, message = "Address must not exceed 500 characters")
  private String address;
}