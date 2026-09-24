package com.realestate.modules.property.entity;

import com.realestate.modules.location.entity.Location;
import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
import com.realestate.modules.property.enums.OwnershipType;
import com.realestate.modules.property.enums.PropertyStatus;
import com.realestate.modules.property.enums.PropertyType;
import com.realestate.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(length = 2000)
  private String description;

  @Column(nullable = false, precision = 15, scale = 2)
  private BigDecimal price;

  @Column(nullable = false)
  private Integer bedrooms;

  @Column(nullable = false)
  private Integer bathrooms;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal area;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private PropertyType propertyType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private ListingType listingType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  @Builder.Default
  private PropertyStatus status = PropertyStatus.PENDING;

  @Enumerated(EnumType.STRING)
  @Column(length = 50)
  private FurnishingStatus furnishingStatus;

  @Enumerated(EnumType.STRING)
  @Column(length = 50)
  private OwnershipType ownershipType;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "seller_id", nullable = false)
  private User seller;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "location_id")
  private Location location;

  @Column(nullable = false, updatable = false)
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}