package com.realestate.modules.messaging.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

  @NotNull(message = "Receiver ID is required")
  private Long receiverId;

  @NotBlank(message = "Message content cannot be empty")
  private String content;
}