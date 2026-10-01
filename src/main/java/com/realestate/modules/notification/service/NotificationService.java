package com.realestate.modules.notification.service;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.user.entity.User;

import java.util.List;

public interface NotificationService {

  NotificationResponse createNotification(
      User recipient,
      CreateNotificationRequest request);

  NotificationResponse getNotificationById(Long notificationId);

  List<NotificationResponse> getMyNotifications();

  List<NotificationResponse> getMyUnreadNotifications();

  long getMyUnreadNotificationCount();

  void markAsRead(Long notificationId);

  void deleteNotification(Long notificationId);
}