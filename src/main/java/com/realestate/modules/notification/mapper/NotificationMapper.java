package com.realestate.modules.notification.mapper;

import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

  public NotificationResponse toResponse(Notification notification) {

    return NotificationResponse.builder()
        .id(notification.getId())
        .recipientId(notification.getRecipient().getId())
        .title(notification.getTitle())
        .message(notification.getMessage())
        .type(notification.getType())
        .isRead(notification.getIsRead())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
