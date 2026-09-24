package com.realestate.modules.location.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponse {

  private Long id;

  private String country;

  private String state;

  private String city;

  private String area;

  private String pincode;

  private String address;
}