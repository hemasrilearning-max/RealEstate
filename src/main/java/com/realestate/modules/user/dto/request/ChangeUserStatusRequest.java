package com.realestate.modules.user.dto.request;

import com.realestate.modules.user.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeUserStatusRequest {

  @NotNull(message = "Status is required")
  private UserStatus status;
}
