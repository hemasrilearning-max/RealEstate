package com.realestate.modules.Broker.dto;

import com.realestate.modules.tour.enums.TourStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerTourRequestDTO {

    private Long id;

    /** users.id of the BUYER */
    private Long buyerId;

    /** properties.id */
    private Long propertyId;

    private String propertyTitle;

    /** users.id of the BROKER */
    private Long brokerId;

    private LocalDate tourDate;

    private LocalTime tourTime;

    private String notes;

    private TourStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
