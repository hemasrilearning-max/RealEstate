package com.realestate.modules.messaging.repository;

import com.realestate.modules.messaging.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

  Optional<Conversation> findByBuyerIdAndSellerIdAndPropertyId(
      Long buyerId,
      Long sellerId,
      Long propertyId);

  List<Conversation> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

  List<Conversation> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

  List<Conversation> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
}