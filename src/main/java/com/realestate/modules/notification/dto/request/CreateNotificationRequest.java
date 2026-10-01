package com.realestate.modules.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Message is required")
  private String message;

  @NotBlank(message = "Notification type is required")
  private String type;
}