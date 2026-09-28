package com.realestate.modules.notification.service;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

  NotificationResponse createNotification(CreateNotificationRequest request);

  NotificationResponse getNotificationById(Long notificationId);

  List<NotificationResponse> getUserNotifications(Long recipientId);

  List<NotificationResponse> getUnreadNotifications(Long recipientId);

  long getUnreadNotificationCount(Long recipientId);

  void markAsRead(Long notificationId);

  void deleteNotification(Long notificationId);
}
