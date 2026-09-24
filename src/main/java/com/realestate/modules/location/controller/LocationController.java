package com.realestate.modules.location.controller;

import com.realestate.modules.location.dto.request.CreateLocationRequest;
import com.realestate.modules.location.dto.request.UpdateLocationRequest;
import com.realestate.modules.location.dto.response.LocationResponse;
import com.realestate.modules.location.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

  private final LocationService locationService;

  @PostMapping
  public ResponseEntity<LocationResponse> createLocation(
      @Valid @RequestBody CreateLocationRequest request) {

    LocationResponse response = locationService.createLocation(request);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<LocationResponse> getLocationById(
      @PathVariable Long id) {

    return ResponseEntity.ok(
        locationService.getLocationById(id));
  }

  @GetMapping
  public ResponseEntity<List<LocationResponse>> getAllLocations() {

    return ResponseEntity.ok(
        locationService.getAllLocations());
  }

  @PutMapping("/{id}")
  public ResponseEntity<LocationResponse> updateLocation(
      @PathVariable Long id,
      @Valid @RequestBody UpdateLocationRequest request) {

    return ResponseEntity.ok(
        locationService.updateLocation(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteLocation(
      @PathVariable Long id) {

    locationService.deleteLocation(id);

    return ResponseEntity.noContent().build();
  }
}