package com.realestate.modules.user.dto.request;

import com.realestate.modules.user.enums.AccountType;
import com.realestate.modules.user.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

  @Size(max = 100, message = "First name must not exceed 100 characters")
  private String firstName;

  @Size(max = 100, message = "Last name must not exceed 100 characters")
  private String lastName;

  @Email(message = "Invalid email format")
  @Size(max = 150, message = "Email must not exceed 150 characters")
  private String email;

  @Size(max = 20, message = "Phone number must not exceed 20 characters")
  private String phone;

  private RoleType role;

  private AccountType accountType;
}
