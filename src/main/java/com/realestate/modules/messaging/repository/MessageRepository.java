package com.realestate.modules.messaging.repository;

import com.realestate.modules.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

  List<Message> findByConversationIdOrderByCreatedAtAsc(
      Long conversationId);

  List<Message> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
      Long receiverId);

  long countByReceiverIdAndIsReadFalse(Long receiverId);

    List<Message> findByBrokerId(Long brokerId);
    List<Message> findByBrokerIdAndIsReadFalse(Long brokerId);
    long countByBrokerIdAndIsReadFalse(Long brokerId);
}