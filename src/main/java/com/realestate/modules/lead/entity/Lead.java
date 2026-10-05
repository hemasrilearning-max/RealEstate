package com.realestate.modules.lead.entity;

import com.realestate.modules.lead.enums.LeadStatus;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Buyer who submitted the interest
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "buyer_id", nullable = false)
  private User buyer;

  // Property in which buyer is interested
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;

  // Seller who listed the property
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seller_id", nullable = false)
  private User seller;

  // Broker assigned to the property
  // NULL when the property has no broker
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "broker_id")
  private User broker;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, length = 150)
  private String email;

  @Column(nullable = false, length = 20)
  private String phone;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  @Builder.Default
  private LeadStatus status = LeadStatus.NEW;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {

    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }

    if (status == null) {
      status = LeadStatus.NEW;
    }
  }
}