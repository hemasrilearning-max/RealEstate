package com.realestate.modules.notification.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

  private Long id;

  private Long recipientId;

  private String title;

  private String message;

  private String type;

  private Boolean isRead;

  private LocalDateTime createdAt;
}
