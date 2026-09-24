package com.realestate.modules.location.mapper;

import com.realestate.modules.location.dto.request.CreateLocationRequest;
import com.realestate.modules.location.dto.response.LocationResponse;
import com.realestate.modules.location.entity.Location;
import org.springframework.stereotype.Component;

@Component
public class LocationMapper {

  public Location toEntity(CreateLocationRequest request) {

    return Location.builder()
        .country(request.getCountry())
        .state(request.getState())
        .city(request.getCity())
        .area(request.getArea())
        .pincode(request.getPincode())
        .address(request.getAddress())
        .build();
  }

  public LocationResponse toResponse(Location location) {

    return LocationResponse.builder()
        .id(location.getId())
        .country(location.getCountry())
        .state(location.getState())
        .city(location.getCity())
        .area(location.getArea())
        .pincode(location.getPincode())
        .address(location.getAddress())
        .build();
  }
}