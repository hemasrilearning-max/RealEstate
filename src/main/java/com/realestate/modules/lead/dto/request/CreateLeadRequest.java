package com.realestate.modules.lead.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLeadRequest {

  @NotNull(message = "Property ID is required")
  private Long propertyId;

  @NotBlank(message = "Name is required")
  private String name;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  private String email;

  @NotBlank(message = "Phone is required")
  @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
  private String phone;

  private String message;
}