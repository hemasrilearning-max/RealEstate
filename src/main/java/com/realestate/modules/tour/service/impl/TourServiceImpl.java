package com.realestate.modules.tour.service.impl;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.tour.dto.request.CreateTourRequest;
import com.realestate.modules.tour.dto.request.UpdateTourRequest;
import com.realestate.modules.tour.dto.response.TourResponse;
import com.realestate.modules.tour.entity.Tour;
import com.realestate.modules.tour.enums.TourStatus;
import com.realestate.modules.tour.mapper.TourMapper;
import com.realestate.modules.tour.repository.TourRepository;
import com.realestate.modules.tour.service.TourService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

  private final TourRepository tourRepository;
  private final PropertyRepository propertyRepository;
  private final UserRepository userRepository;
  private final TourMapper tourMapper;

  @Override
  @Transactional
  public TourResponse createTour(CreateTourRequest request) {

    boolean alreadyBooked = tourRepository.existsByPropertyIdAndTourDateAndTourTime(
        request.getPropertyId(),
        request.getTourDate(),
        request.getTourTime());

    if (alreadyBooked) {
      throw new IllegalArgumentException(
          "A tour is already scheduled for this property at the selected date and time");
    }

    Property property = propertyRepository.findById(
        request.getPropertyId()).orElseThrow(
            () -> new IllegalArgumentException(
                "Property not found with ID: "
                    + request.getPropertyId()));

    User buyer = userRepository.findById(
        request.getBuyerId()).orElseThrow(
            () -> new IllegalArgumentException(
                "Buyer not found with ID: "
                    + request.getBuyerId()));

    Tour tour = Tour.builder()
        .property(property)
        .buyer(buyer)
        .tourDate(request.getTourDate())
        .tourTime(request.getTourTime())
        .status(TourStatus.PENDING)
        .notes(request.getNotes())
        .build();

    Tour savedTour = tourRepository.save(tour);

    return tourMapper.toResponse(savedTour);
  }

  @Override
  @Transactional(readOnly = true)
  public TourResponse getTourById(Long id) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    return tourMapper.toResponse(tour);
  }

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByBuyer(Long buyerId) {

    return tourRepository.findByBuyerId(buyerId)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByProperty(Long propertyId) {

    return tourRepository.findByPropertyId(propertyId)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByStatus(TourStatus status) {

    return tourRepository.findByStatus(status)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByDate(LocalDate tourDate) {

    return tourRepository.findByTourDate(tourDate)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional
  public TourResponse updateTour(
      Long id,
      UpdateTourRequest request) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    if (request.getTourDate() != null) {
      tour.setTourDate(request.getTourDate());
    }

    if (request.getTourTime() != null) {
      tour.setTourTime(request.getTourTime());
    }

    if (request.getNotes() != null) {
      tour.setNotes(request.getNotes());
    }

    Tour updatedTour = tourRepository.save(tour);

    return tourMapper.toResponse(updatedTour);
  }

  @Override
  @Transactional
  public TourResponse updateTourStatus(
      Long id,
      TourStatus status) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    tour.setStatus(status);

    Tour updatedTour = tourRepository.save(tour);

    return tourMapper.toResponse(updatedTour);
  }

  @Override
  @Transactional
  public void deleteTour(Long id) {

    if (!tourRepository.existsById(id)) {
      throw new IllegalArgumentException(
          "Tour not found with ID: " + id);
    }

    tourRepository.deleteById(id);
  }
}