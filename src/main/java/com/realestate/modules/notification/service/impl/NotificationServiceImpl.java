package com.realestate.modules.notification.service.impl;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.notification.entity.Notification;
import com.realestate.modules.notification.mapper.NotificationMapper;
import com.realestate.modules.notification.repository.NotificationRepository;
import com.realestate.modules.notification.service.NotificationService;
import com.realestate.modules.user.entity.User;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationMapper notificationMapper;
  private final AuthenticatedUserService authenticatedUserService;

  /**
   * Creates a notification for the specified recipient.
   *
   * This method is intended to be called by other business modules
   * such as Tour, Property, Messaging, Payment, Admin, etc.
   */
  @Override
  public NotificationResponse createNotification(
      User recipient,
      CreateNotificationRequest request) {

    if (recipient == null) {
      throw new RuntimeException("Notification recipient is required");
    }

    Notification notification = Notification.builder()
        .recipient(recipient)
        .title(request.getTitle())
        .message(request.getMessage())
        .type(request.getType())
        .isRead(false)
        .build();

    Notification savedNotification = notificationRepository.save(notification);

    return notificationMapper.toResponse(savedNotification);
  }

  @Override
  @Transactional(readOnly = true)
  public NotificationResponse getNotificationById(Long notificationId) {

    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    validateNotificationAccess(notification);

    return notificationMapper.toResponse(notification);
  }

  @Override
  @Transactional(readOnly = true)
  public List<NotificationResponse> getMyNotifications() {

    User currentUser = authenticatedUserService.getCurrentUser();

    return notificationRepository
        .findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
        .stream()
        .map(notificationMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<NotificationResponse> getMyUnreadNotifications() {

    User currentUser = authenticatedUserService.getCurrentUser();

    return notificationRepository
        .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(
            currentUser.getId())
        .stream()
        .map(notificationMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public long getMyUnreadNotificationCount() {

    User currentUser = authenticatedUserService.getCurrentUser();

    return notificationRepository
        .countByRecipientIdAndIsReadFalse(currentUser.getId());
  }

  @Override
  public void markAsRead(Long notificationId) {

    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    validateNotificationAccess(notification);

    notification.setIsRead(true);

    notificationRepository.save(notification);
  }

  @Override
  public void deleteNotification(Long notificationId) {

    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    validateNotificationAccess(notification);

    notificationRepository.delete(notification);
  }

  /**
   * Makes sure that the logged-in user owns the notification.
   */
  private void validateNotificationAccess(Notification notification) {

    User currentUser = authenticatedUserService.getCurrentUser();

    if (!currentUser.getId().equals(
        notification.getRecipient().getId())) {

      throw new AccessDeniedException(
          "You are not allowed to access this notification");
    }
  }
}