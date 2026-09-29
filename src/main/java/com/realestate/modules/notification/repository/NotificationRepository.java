package com.realestate.modules.notification.repository;

import com.realestate.modules.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

  List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);

  long countByRecipientIdAndIsReadFalse(Long recipientId);
}
