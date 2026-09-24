package com.realestate.modules.tour.repository;

import com.realestate.modules.tour.entity.Tour;
import com.realestate.modules.tour.enums.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long> {

  List<Tour> findByBuyerId(Long buyerId);

  List<Tour> findByPropertyId(Long propertyId);

  List<Tour> findByStatus(TourStatus status);

  List<Tour> findByTourDate(LocalDate tourDate);

  boolean existsByPropertyIdAndTourDateAndTourTime(
      Long propertyId,
      LocalDate tourDate,
      java.time.LocalTime tourTime);
}