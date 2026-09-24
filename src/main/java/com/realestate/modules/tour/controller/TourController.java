package com.realestate.modules.tour.controller;

import com.realestate.modules.tour.dto.request.CreateTourRequest;
import com.realestate.modules.tour.dto.request.UpdateTourRequest;
import com.realestate.modules.tour.dto.response.TourResponse;
import com.realestate.modules.tour.enums.TourStatus;
import com.realestate.modules.tour.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

  private final TourService tourService;

  @PostMapping
  public ResponseEntity<TourResponse> createTour(
      @Valid @RequestBody CreateTourRequest request) {

    TourResponse response = tourService.createTour(request);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TourResponse> getTourById(
      @PathVariable Long id) {

    return ResponseEntity.ok(
        tourService.getTourById(id));
  }

  @GetMapping("/buyer/{buyerId}")
  public ResponseEntity<List<TourResponse>> getToursByBuyer(
      @PathVariable Long buyerId) {

    return ResponseEntity.ok(
        tourService.getToursByBuyer(buyerId));
  }

  @GetMapping("/property/{propertyId}")
  public ResponseEntity<List<TourResponse>> getToursByProperty(
      @PathVariable Long propertyId) {

    return ResponseEntity.ok(
        tourService.getToursByProperty(propertyId));
  }

  @GetMapping("/status/{status}")
  public ResponseEntity<List<TourResponse>> getToursByStatus(
      @PathVariable TourStatus status) {

    return ResponseEntity.ok(
        tourService.getToursByStatus(status));
  }

  @GetMapping("/date/{tourDate}")
  public ResponseEntity<List<TourResponse>> getToursByDate(
      @PathVariable LocalDate tourDate) {

    return ResponseEntity.ok(
        tourService.getToursByDate(tourDate));
  }

  @PutMapping("/{id}")
  public ResponseEntity<TourResponse> updateTour(
      @PathVariable Long id,
      @Valid @RequestBody UpdateTourRequest request) {

    return ResponseEntity.ok(
        tourService.updateTour(id, request));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<TourResponse> updateTourStatus(
      @PathVariable Long id,
      @RequestParam TourStatus status) {

    return ResponseEntity.ok(
        tourService.updateTourStatus(id, status));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTour(
      @PathVariable Long id) {

    tourService.deleteTour(id);

    return ResponseEntity.noContent().build();
  }
}