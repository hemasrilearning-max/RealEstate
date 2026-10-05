package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerTourRequestDTO;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.tour.entity.Tour;
import com.realestate.modules.tour.enums.TourStatus;
import com.realestate.modules.tour.repository.TourRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Uses existing tours table + existing Tour entity.
 * Requires broker_id column added to tours table and Tour entity.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerTourRequestService {

    private final TourRepository tourRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BrokerTourRequestDTO createTourRequest(Long brokerId, BrokerTourRequestDTO dto) {
        if (dto.getBuyerId() == null) {
            throw new IllegalArgumentException("buyerId is required");
        }
        if (dto.getPropertyId() == null) {
            throw new IllegalArgumentException("propertyId is required");
        }

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Property not found: " + dto.getPropertyId()));

        User buyer = userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new BrokerResourceNotFoundException("Buyer not found: " + dto.getBuyerId()));

        Tour tour = Tour.builder()
                .property(property)
                .buyer(buyer)
                .tourDate(dto.getTourDate())
                .tourTime(dto.getTourTime())
                .notes(dto.getNotes())
                .status(TourStatus.PENDING)
                .build();

        tour.setBrokerId(brokerId);

        return mapToDTO(tourRepository.save(tour));
    }

    @Transactional(readOnly = true)
    public List<BrokerTourRequestDTO> getAllTourRequestsByBroker(Long brokerId) {
        return tourRepository.findByBrokerId(brokerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BrokerTourRequestDTO> getTourRequestsByBrokerPaged(Long brokerId, int page, int size) {
        List<BrokerTourRequestDTO> all = getAllTourRequestsByBroker(brokerId);
        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());
        return new PageImpl<>(all.subList(start, end), PageRequest.of(page, size), all.size());
    }

    @Transactional(readOnly = true)
    public List<BrokerTourRequestDTO> getPendingTours(Long brokerId) {
        return tourRepository.findByBrokerIdAndStatus(brokerId, TourStatus.PENDING)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BrokerTourRequestDTO getTourRequestById(Long brokerId, Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Tour not found: " + tourId));
        if (tour.getBrokerId() != null && !brokerId.equals(tour.getBrokerId())) {
            throw new BrokerResourceNotFoundException("Tour does not belong to this broker");
        }
        return mapToDTO(tour);
    }

    public BrokerTourRequestDTO updateTourRequest(Long brokerId, Long tourId, BrokerTourRequestDTO dto) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Tour not found: " + tourId));
        if (dto.getTourDate() != null) tour.setTourDate(dto.getTourDate());
        if (dto.getTourTime() != null) tour.setTourTime(dto.getTourTime());
        if (dto.getNotes() != null) tour.setNotes(dto.getNotes());
        return mapToDTO(tourRepository.save(tour));
    }

    public BrokerTourRequestDTO updateTourStatus(Long brokerId, Long tourId, TourStatus status) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Tour not found: " + tourId));
        tour.setStatus(status);
        return mapToDTO(tourRepository.save(tour));
    }

    public void deleteTourRequest(Long brokerId, Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new BrokerResourceNotFoundException("Tour not found: " + tourId));
        tourRepository.delete(tour);
    }

    private BrokerTourRequestDTO mapToDTO(Tour tour) {
        return BrokerTourRequestDTO.builder()
                .id(tour.getId())
                .buyerId(tour.getBuyer() != null ? tour.getBuyer().getId() : null)
                .propertyId(tour.getProperty() != null ? tour.getProperty().getId() : null)
                .propertyTitle(tour.getProperty() != null ? tour.getProperty().getTitle() : null)
                .brokerId(tour.getBrokerId())
                .tourDate(tour.getTourDate())
                .tourTime(tour.getTourTime())
                .notes(tour.getNotes())
                .status(tour.getStatus() != null ? 
                        tour.getStatus() : null)
                .createdAt(tour.getCreatedAt())
                .updatedAt(tour.getUpdatedAt())
                .build();
    }
}
