package com.realestate.modules.tour.service.impl;

import com.realestate.modules.notification.dto.request.CreateNotificationRequest;
import com.realestate.modules.notification.service.NotificationService;
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
import com.realestate.modules.user.enums.RoleType;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

  private final TourRepository tourRepository;
  private final PropertyRepository propertyRepository;
  private final TourMapper tourMapper;
  private final AuthenticatedUserService authenticatedUserService;

  // Notification service
  private final NotificationService notificationService;

  // ============================================================
  // CREATE TOUR
  // ============================================================

  @Override
  @Transactional
  public TourResponse createTour(CreateTourRequest request) {

    // Get logged-in user from JWT
    User buyer = authenticatedUserService.getCurrentUser();

    // Only BUYER can create a tour
    if (buyer.getRole().getName() != RoleType.BUYER) {
      throw new AccessDeniedException(
          "Only BUYER users can create tours");
    }

    // Check whether property exists
    Property property = propertyRepository.findById(
        request.getPropertyId()).orElseThrow(
            () -> new IllegalArgumentException(
                "Property not found with ID: "
                    + request.getPropertyId()));

    // Check whether this time slot is already booked
    boolean alreadyBooked = tourRepository
        .existsByPropertyIdAndTourDateAndTourTime(
            request.getPropertyId(),
            request.getTourDate(),
            request.getTourTime());

    if (alreadyBooked) {
      throw new IllegalArgumentException(
          "A tour is already scheduled for this property "
              + "at the selected date and time");
    }

    // Create tour
    Tour tour = Tour.builder()
        .property(property)
        .buyer(buyer)
        .tourDate(request.getTourDate())
        .tourTime(request.getTourTime())
        .status(TourStatus.PENDING)
        .notes(request.getNotes())
        .build();

    // Save tour
    Tour savedTour = tourRepository.save(tour);

    // ==========================================================
    // NOTIFY SELLER
    // ==========================================================

    User seller = property.getSeller();

    if (seller != null) {

      CreateNotificationRequest sellerNotification = CreateNotificationRequest.builder()
          .title("New Tour Request")
          .message(
              "A buyer has requested a property tour for "
                  + property.getTitle()
                  + " on "
                  + request.getTourDate()
                  + " at "
                  + request.getTourTime()
                  + ".")
          .type("TOUR_REQUEST")
          .build();

      notificationService.createNotification(
          seller,
          sellerNotification);
    }

    // ==========================================================
    // NOTIFY BROKER
    // ==========================================================

    User broker = property.getBroker();

    if (broker != null) {

      CreateNotificationRequest brokerNotification = CreateNotificationRequest.builder()
          .title("New Tour Request")
          .message(
              "A buyer has requested a property tour for "
                  + property.getTitle()
                  + " on "
                  + request.getTourDate()
                  + " at "
                  + request.getTourTime()
                  + ".")
          .type("TOUR_REQUEST")
          .build();

      notificationService.createNotification(
          broker,
          brokerNotification);
    }

    return tourMapper.toResponse(savedTour);
  }

  // ============================================================
  // GET TOUR BY ID
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public TourResponse getTourById(Long id) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    return tourMapper.toResponse(tour);
  }

  // ============================================================
  // GET TOURS BY BUYER
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByBuyer(Long buyerId) {

    return tourRepository.findByBuyerId(buyerId)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  // ============================================================
  // GET TOURS BY PROPERTY
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByProperty(Long propertyId) {

    return tourRepository.findByPropertyId(propertyId)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  // ============================================================
  // GET TOURS BY STATUS
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByStatus(
      TourStatus status) {

    return tourRepository.findByStatus(status)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  // ============================================================
  // GET TOURS BY DATE
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<TourResponse> getToursByDate(
      LocalDate tourDate) {

    return tourRepository.findByTourDate(tourDate)
        .stream()
        .map(tourMapper::toResponse)
        .toList();
  }

  // ============================================================
  // UPDATE TOUR
  // ============================================================

  @Override
  @Transactional
  public TourResponse updateTour(
      Long id,
      UpdateTourRequest request) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    validateBuyerOwnership(tour);

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

  // ============================================================
  // UPDATE TOUR STATUS
  // ============================================================

  @Override
  @Transactional
  public TourResponse updateTourStatus(
      Long id,
      TourStatus status) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    User currentUser = authenticatedUserService.getCurrentUser();

    Property property = tour.getProperty();

    // Check whether current user is the property seller
    boolean isSeller = property.getSeller() != null
        && property.getSeller()
            .getId()
            .equals(currentUser.getId());

    // Check whether current user is the assigned broker
    boolean isBroker = property.getBroker() != null
        && property.getBroker()
            .getId()
            .equals(currentUser.getId());

    // Only seller OR broker can approve/reject
    if (!isSeller && !isBroker) {

      throw new AccessDeniedException(
          "Only the property seller or assigned broker "
              + "can update the tour status");
    }

    // Only pending tours can be approved/rejected
    if (tour.getStatus() != TourStatus.PENDING) {

      throw new IllegalStateException(
          "Only pending tours can be approved or rejected");
    }

    // Seller/Broker can only confirm or reject
    if (status != TourStatus.CONFIRMED
        && status != TourStatus.REJECTED) {

      throw new IllegalArgumentException(
          "Seller or broker can only CONFIRM or REJECT a tour");
    }

    // Update status
    tour.setStatus(status);

    Tour updatedTour = tourRepository.save(tour);

    // ==========================================================
    // NOTIFY BUYER
    // ==========================================================

    User buyer = tour.getBuyer();

    if (buyer != null) {

      String title;
      String message;

      if (status == TourStatus.CONFIRMED) {

        title = "Tour Confirmed";

        message = "Your tour request for "
            + property.getTitle()
            + " on "
            + tour.getTourDate()
            + " at "
            + tour.getTourTime()
            + " has been confirmed.";

      } else {

        title = "Tour Rejected";

        message = "Your tour request for "
            + property.getTitle()
            + " on "
            + tour.getTourDate()
            + " at "
            + tour.getTourTime()
            + " has been rejected.";
      }

      CreateNotificationRequest buyerNotification = CreateNotificationRequest.builder()
          .title(title)
          .message(message)
          .type("TOUR_STATUS")
          .build();

      notificationService.createNotification(
          buyer,
          buyerNotification);
    }

    return tourMapper.toResponse(updatedTour);
  }

  // ============================================================
  // DELETE TOUR
  // ============================================================

  @Override
  @Transactional
  public void deleteTour(Long id) {

    Tour tour = tourRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException(
            "Tour not found with ID: " + id));

    validateBuyerOwnership(tour);

    tourRepository.delete(tour);
  }

  // ============================================================
  // BUYER OWNERSHIP VALIDATION
  // ============================================================

  private void validateBuyerOwnership(Tour tour) {

    User currentUser = authenticatedUserService.getCurrentUser();

    // Only BUYER can modify their own tour
    if (currentUser.getRole().getName() != RoleType.BUYER) {

      throw new AccessDeniedException(
          "Only BUYER users can modify tours");
    }

    // Check whether this tour belongs to logged-in buyer
    if (!tour.getBuyer()
        .getId()
        .equals(currentUser.getId())) {

      throw new AccessDeniedException(
          "You are not authorized to modify this tour");
    }
  }
}