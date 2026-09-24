package com.realestate.modules.location.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.modules.location.dto.request.CreateLocationRequest;
import com.realestate.modules.location.dto.request.UpdateLocationRequest;
import com.realestate.modules.location.dto.response.LocationResponse;
import com.realestate.modules.location.entity.Location;
import com.realestate.modules.location.mapper.LocationMapper;
import com.realestate.modules.location.repository.LocationRepository;
import com.realestate.modules.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

  private final LocationRepository locationRepository;
  private final LocationMapper locationMapper;

  @Override
  @Transactional
  public LocationResponse createLocation(CreateLocationRequest request) {

    Location location = locationMapper.toEntity(request);

    Location savedLocation = locationRepository.save(location);

    return locationMapper.toResponse(savedLocation);
  }

  @Override
  @Transactional(readOnly = true)
  public LocationResponse getLocationById(Long id) {

    Location location = locationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Location not found with id: " + id));

    return locationMapper.toResponse(location);
  }

  @Override
  @Transactional(readOnly = true)
  public List<LocationResponse> getAllLocations() {

    return locationRepository.findAll()
        .stream()
        .map(locationMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional
  public LocationResponse updateLocation(
      Long id,
      UpdateLocationRequest request) {

    Location location = locationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Location not found with id: " + id));

    if (request.getCountry() != null) {
      location.setCountry(request.getCountry());
    }

    if (request.getState() != null) {
      location.setState(request.getState());
    }

    if (request.getCity() != null) {
      location.setCity(request.getCity());
    }

    if (request.getArea() != null) {
      location.setArea(request.getArea());
    }

    if (request.getPincode() != null) {
      location.setPincode(request.getPincode());
    }

    if (request.getAddress() != null) {
      location.setAddress(request.getAddress());
    }

    Location updatedLocation = locationRepository.save(location);

    return locationMapper.toResponse(updatedLocation);
  }

  @Override
  @Transactional
  public void deleteLocation(Long id) {

    Location location = locationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Location not found with id: " + id));

    locationRepository.delete(location);
  }
}