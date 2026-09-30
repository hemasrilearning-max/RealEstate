package com.realestate.modules.notification.controller;

import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<List<NotificationResponse>> getMyNotifications() {

    return ResponseEntity.ok(
        notificationService.getMyNotifications());
  }

  @GetMapping("/unread")
  public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications() {

    return ResponseEntity.ok(
        notificationService.getMyUnreadNotifications());
  }

  @GetMapping("/unread/count")
  public ResponseEntity<Long> getMyUnreadNotificationCount() {

    return ResponseEntity.ok(
        notificationService.getMyUnreadNotificationCount());
  }

  @GetMapping("/{notificationId}")
  public ResponseEntity<NotificationResponse> getNotificationById(
      @PathVariable Long notificationId) {

    return ResponseEntity.ok(
        notificationService.getNotificationById(notificationId));
  }

  @PatchMapping("/{notificationId}/read")
  public ResponseEntity<Void> markAsRead(
      @PathVariable Long notificationId) {

    notificationService.markAsRead(notificationId);

    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{notificationId}")
  public ResponseEntity<Void> deleteNotification(
      @PathVariable Long notificationId) {

    notificationService.deleteNotification(notificationId);

    return ResponseEntity.noContent().build();
  }
}