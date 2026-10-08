package com.realestate.modules.property.mapper;

import com.realestate.modules.location.dto.response.LocationResponse;
import com.realestate.modules.location.entity.Location;
import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class PropertyMapper {

    public Property toEntity(
            CreatePropertyRequest request,
            User seller,
            Location location) {

        return Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .area(request.getArea())
                .propertyType(request.getPropertyType())
                .listingType(request.getListingType())
                .furnishingStatus(request.getFurnishingStatus())
                .ownershipType(request.getOwnershipType())
                .seller(seller)
                .location(location)
                .build();
    }

    public PropertyResponse toResponse(Property property) {

        LocationResponse locationResponse = null;

        if (property.getLocation() != null) {
            Location location = property.getLocation();

            locationResponse = LocationResponse.builder()
                    .id(location.getId())
                    .country(location.getCountry())
                    .state(location.getState())
                    .city(location.getCity())
                    .area(location.getArea())
                    .pincode(location.getPincode())
                    .address(location.getAddress())
                    .build();
        }

        String sellerName = "";

        if (property.getSeller() != null) {
            sellerName =
                    safe(property.getSeller().getFirstName())
                            + " "
                            + safe(property.getSeller().getLastName());

            sellerName = sellerName.trim();
        }

        Long sellerId = null;

        if (property.getSeller() != null) {
            sellerId = property.getSeller().getId();
        }

        /*
         * ============================================================
         * BROKER
         * ============================================================
         *
         * The broker relationship is stored in:
         *
         * properties.broker_id
         *
         * and mapped by:
         *
         * Property.broker
         *
         * Make sure the broker ID is included in PropertyResponse.
         */
        Long brokerId = null;

        if (property.getBroker() != null) {
            brokerId = property.getBroker().getId();
        }

        Long createdById = null;
        String createdByName = null;

        if (property.getCreatedBy() != null) {
            createdById = property.getCreatedBy().getId();

            createdByName =
                    safe(property.getCreatedBy().getFirstName())
                            + " "
                            + safe(property.getCreatedBy().getLastName());

            createdByName = createdByName.trim();
        }

        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .price(property.getPrice())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .propertyType(property.getPropertyType())
                .listingType(property.getListingType())
                .status(property.getStatus())
                .furnishingStatus(property.getFurnishingStatus())
                .ownershipType(property.getOwnershipType())
                .location(locationResponse)

                .sellerId(sellerId)
                .sellerName(sellerName)

                // IMPORTANT: expose broker_id to frontend
                .brokerId(brokerId)

                .createdById(createdById)
                .createdByName(createdByName)
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
