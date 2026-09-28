package com.realestate.modules.notification.service.impl;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.notification.entity.Notification;
import com.realestate.modules.notification.mapper.NotificationMapper;
import com.realestate.modules.notification.repository.NotificationRepository;
import com.realestate.modules.notification.service.NotificationService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final NotificationMapper notificationMapper;

  @Override
  public NotificationResponse createNotification(CreateNotificationRequest request) {

    User recipient = userRepository.findById(request.getRecipientId())
        .orElseThrow(() -> new RuntimeException("Recipient user not found"));

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

    return notificationMapper.toResponse(notification);
  }

  @Override
  @Transactional(readOnly = true)
  public List<NotificationResponse> getUserNotifications(Long recipientId) {

    return notificationRepository
        .findByRecipientIdOrderByCreatedAtDesc(recipientId)
        .stream()
        .map(notificationMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<NotificationResponse> getUnreadNotifications(Long recipientId) {

    return notificationRepository
        .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(recipientId)
        .stream()
        .map(notificationMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public long getUnreadNotificationCount(Long recipientId) {

    return notificationRepository
        .countByRecipientIdAndIsReadFalse(recipientId);
  }

  @Override
  public void markAsRead(Long notificationId) {

    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    notification.setIsRead(true);

    notificationRepository.save(notification);
  }

  @Override
  public void deleteNotification(Long notificationId) {

    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new RuntimeException("Notification not found"));

    notificationRepository.delete(notification);
  }
}
