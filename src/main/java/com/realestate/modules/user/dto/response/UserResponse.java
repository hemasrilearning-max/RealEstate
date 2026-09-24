package com.realestate.modules.user.dto.response;

import com.realestate.modules.user.enums.AccountType;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

  private Long id;

  private String firstName;

  private String lastName;

  private String email;

  private String phone;

  private RoleType role;

  private UserStatus status;

  private AccountType accountType;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}
