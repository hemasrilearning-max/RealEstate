package com.realestate.modules.review.entity;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.review.enums.ReviewStatus;
import com.realestate.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(name = "uk_review_user_property", columnNames = { "user_id", "property_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;

  @Column(nullable = false)
  private Integer rating;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String comment;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @Builder.Default
  private ReviewStatus status = ReviewStatus.PENDING;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {

    LocalDateTime now = LocalDateTime.now();

    if (createdAt == null) {
      createdAt = now;
    }

    if (updatedAt == null) {
      updatedAt = now;
    }

    if (status == null) {
      status = ReviewStatus.PENDING;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}