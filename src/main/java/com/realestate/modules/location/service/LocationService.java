package com.realestate.modules.location.service;

import com.realestate.modules.location.dto.request.CreateLocationRequest;
import com.realestate.modules.location.dto.request.UpdateLocationRequest;
import com.realestate.modules.location.dto.response.LocationResponse;

import java.util.List;

public interface LocationService {

  LocationResponse createLocation(CreateLocationRequest request);

  LocationResponse getLocationById(Long id);

  List<LocationResponse> getAllLocations();

  LocationResponse updateLocation(
      Long id,
      UpdateLocationRequest request);

  void deleteLocation(Long id);
}