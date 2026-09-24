package com.realestate.modules.tour.service;

import com.realestate.modules.tour.dto.request.CreateTourRequest;
import com.realestate.modules.tour.dto.request.UpdateTourRequest;
import com.realestate.modules.tour.dto.response.TourResponse;
import com.realestate.modules.tour.enums.TourStatus;

import java.time.LocalDate;
import java.util.List;

public interface TourService {

  TourResponse createTour(CreateTourRequest request);

  TourResponse getTourById(Long id);

  List<TourResponse> getToursByBuyer(Long buyerId);

  List<TourResponse> getToursByProperty(Long propertyId);

  List<TourResponse> getToursByStatus(TourStatus status);

  List<TourResponse> getToursByDate(LocalDate tourDate);

  TourResponse updateTour(Long id, UpdateTourRequest request);

  TourResponse updateTourStatus(Long id, TourStatus status);

  void deleteTour(Long id);
}