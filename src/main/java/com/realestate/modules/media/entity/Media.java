package com.realestate.modules.media.entity;

import com.realestate.modules.media.enums.MediaType;
import com.realestate.modules.property.entity.Property;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String fileName;

  @Column(nullable = false, length = 1000)
  private String fileUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private MediaType mediaType;

  @Column(name = "is_primary", nullable = false)
  @Builder.Default
  private Boolean primary = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "property_id", nullable = false)
  private Property property;
}