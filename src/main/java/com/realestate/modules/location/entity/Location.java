package com.realestate.modules.location.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String country;

  @Column(nullable = false, length = 100)
  private String state;

  @Column(nullable = false, length = 100)
  private String city;

  @Column(length = 100)
  private String area;

  @Column(length = 20)
  private String pincode;

  @Column(length = 500)
  private String address;
}