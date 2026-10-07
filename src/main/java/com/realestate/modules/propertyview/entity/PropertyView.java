package com.realestate.modules.propertyview.entity;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "property_views", uniqueConstraints = {
    @UniqueConstraint(name = "uk_property_view_user", columnNames = { "property_id", "user_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyView {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private LocalDateTime viewedAt;

  @PrePersist
  protected void onCreate() {
    viewedAt = LocalDateTime.now();
  }
}