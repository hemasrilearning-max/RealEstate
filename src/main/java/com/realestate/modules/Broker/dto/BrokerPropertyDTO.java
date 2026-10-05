package com.realestate.modules.Broker.dto;

import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
import com.realestate.modules.property.enums.OwnershipType;
import com.realestate.modules.property.enums.PropertyStatus;
import com.realestate.modules.property.enums.PropertyType;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrokerPropertyDTO {

    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private Integer bedrooms;

    private Integer bathrooms;

    private BigDecimal area;

    private PropertyType propertyType;

    private ListingType listingType;

    private PropertyStatus status;

    private FurnishingStatus furnishingStatus;

    private OwnershipType ownershipType;

    /**
     * users.id - actual property owner/seller.
     */
    private Long sellerId;

    /**
     * users.id - broker managing/listing the property.
     */
    private Long brokerId;

    /**
     * locations.id
     */
    private Long locationId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}