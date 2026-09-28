package com.realestate.modules.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {

  @NotNull(message = "Recipient ID is required")
  private Long recipientId;

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Message is required")
  private String message;

  @NotBlank(message = "Notification type is required")
  private String type;
}