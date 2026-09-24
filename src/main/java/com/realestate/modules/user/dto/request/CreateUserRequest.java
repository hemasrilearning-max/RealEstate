package com.realestate.modules.user.dto.request;

import com.realestate.modules.user.enums.AccountType;
import com.realestate.modules.user.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

  @NotBlank(message = "First name is required")
  @Size(max = 100, message = "First name must not exceed 100 characters")
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Size(max = 100, message = "Last name must not exceed 100 characters")
  private String lastName;

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  @Size(max = 150, message = "Email must not exceed 150 characters")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
  private String password;

  @Size(max = 20, message = "Phone number must not exceed 20 characters")
  private String phone;

  @NotNull(message = "Role is required")
  private RoleType role;

  private AccountType accountType;
}