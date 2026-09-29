package com.realestate.modules.notification.controller;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.dto.response.NotificationResponse;
import com.realestate.modules.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;

  @PostMapping
  public ResponseEntity<NotificationResponse> createNotification(
      @Valid @RequestBody CreateNotificationRequest request) {

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(notificationService.createNotification(request));
  }

  @GetMapping("/{notificationId}")
  public ResponseEntity<NotificationResponse> getNotificationById(
      @PathVariable Long notificationId) {

    return ResponseEntity.ok(
        notificationService.getNotificationById(notificationId));
  }

  @GetMapping("/user/{recipientId}")
  public ResponseEntity<List<NotificationResponse>> getUserNotifications(
      @PathVariable Long recipientId) {

    return ResponseEntity.ok(
        notificationService.getUserNotifications(recipientId));
  }

  @GetMapping("/user/{recipientId}/unread")
  public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
      @PathVariable Long recipientId) {

    return ResponseEntity.ok(
        notificationService.getUnreadNotifications(recipientId));
  }

  @GetMapping("/user/{recipientId}/unread/count")
  public ResponseEntity<Long> getUnreadNotificationCount(
      @PathVariable Long recipientId) {

    return ResponseEntity.ok(
        notificationService.getUnreadNotificationCount(recipientId));
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