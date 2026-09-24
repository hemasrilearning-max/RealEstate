package com.realestate.modules.tour.mapper;

import com.realestate.modules.tour.dto.response.TourResponse;
import com.realestate.modules.tour.entity.Tour;
import org.springframework.stereotype.Component;

@Component
public class TourMapper {

  public TourResponse toResponse(Tour tour) {

    String buyerName = null;

    if (tour.getBuyer() != null) {
      buyerName = (tour.getBuyer().getFirstName()
          + " "
          + tour.getBuyer().getLastName()).trim();
    }

    return TourResponse.builder()
        .id(tour.getId())

        .propertyId(
            tour.getProperty() != null
                ? tour.getProperty().getId()
                : null)

        .propertyTitle(
            tour.getProperty() != null
                ? tour.getProperty().getTitle()
                : null)

        .buyerId(
            tour.getBuyer() != null
                ? tour.getBuyer().getId()
                : null)

        .buyerName(buyerName)

        .tourDate(tour.getTourDate())
        .tourTime(tour.getTourTime())
        .status(tour.getStatus())
        .notes(tour.getNotes())
        .createdAt(tour.getCreatedAt())
        .updatedAt(tour.getUpdatedAt())

        .build();
  }
}