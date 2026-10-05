package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.location.entity.Location;
import com.realestate.modules.location.repository.LocationRepository;
import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BrokerPropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    /**
     * Create property for a broker.
     *
     * brokerId = users.id of the logged-in broker.
     * sellerId = users.id of the actual property owner.
     */
    public PropertyResponse createProperty(
            Long brokerId,
            CreatePropertyRequest request) {

        // Find broker
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Broker not found with id: " + brokerId
                        )
                );

        // Find seller/owner
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Seller not found with id: "
                                        + request.getSellerId()
                        )
                );

        // Find location
        Location location = locationRepository
                .findById(request.getLocationId())
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Location not found with id: "
                                        + request.getLocationId()
                        )
                );

        // Create property
        Property property = Property.builder()
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
                .broker(broker)
                .location(location)
                .build();

        Property savedProperty = propertyRepository.save(property);

        return mapToResponse(savedProperty);
    }

    /**
     * Get all properties managed by a broker.
     */
    @Transactional(readOnly = true)
    public List<PropertyResponse> getAllPropertiesByBroker(
            Long brokerId) {

        return propertyRepository
                .findByBroker_Id(brokerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get broker properties with pagination.
     */
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getPropertiesByBrokerPaged(
            Long brokerId,
            int page,
            int size) {

        return propertyRepository
                .findByBroker_Id(
                        brokerId,
                        PageRequest.of(page, size)
                )
                .map(this::mapToResponse);
    }

    /**
     * Get a specific property belonging to the broker.
     */
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(
            Long brokerId,
            Long propertyId) {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Property not found with id: "
                                        + propertyId
                        )
                );

        validateBrokerOwnership(property, brokerId);

        return mapToResponse(property);
    }

    /**
     * Update broker property.
     */
    public PropertyResponse updateProperty(
            Long brokerId,
            Long propertyId,
            UpdatePropertyRequest request) {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Property not found with id: "
                                        + propertyId
                        )
                );

        validateBrokerOwnership(property, brokerId);

        if (request.getTitle() != null) {
            property.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            property.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            property.setPrice(request.getPrice());
        }

        if (request.getBedrooms() != null) {
            property.setBedrooms(request.getBedrooms());
        }

        if (request.getBathrooms() != null) {
            property.setBathrooms(request.getBathrooms());
        }

        if (request.getArea() != null) {
            property.setArea(request.getArea());
        }

        if (request.getPropertyType() != null) {
            property.setPropertyType(request.getPropertyType());
        }

        if (request.getListingType() != null) {
            property.setListingType(request.getListingType());
        }

        if (request.getStatus() != null) {
            property.setStatus(request.getStatus());
        }

        if (request.getFurnishingStatus() != null) {
            property.setFurnishingStatus(
                    request.getFurnishingStatus()
            );
        }

        if (request.getOwnershipType() != null) {
            property.setOwnershipType(
                    request.getOwnershipType()
            );
        }

        // Update location if provided
        if (request.getLocationId() != null) {

            Location location = locationRepository
                    .findById(request.getLocationId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Location not found with id: "
                                            + request.getLocationId()
                            )
                    );

            property.setLocation(location);
        }

        // Update seller/owner if provided
        if (request.getSellerId() != null) {

            User seller = userRepository
                    .findById(request.getSellerId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Seller not found with id: "
                                            + request.getSellerId()
                            )
                    );

            property.setSeller(seller);
        }

        return mapToResponse(
                propertyRepository.save(property)
        );
    }

    /**
     * Delete broker property.
     */
    public void deleteProperty(
            Long brokerId,
            Long propertyId) {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Property not found with id: "
                                        + propertyId
                        )
                );

        validateBrokerOwnership(property, brokerId);

        propertyRepository.delete(property);
    }

    /**
     * Verify that the property belongs to the broker.
     */
    private void validateBrokerOwnership(
            Property property,
            Long brokerId) {

        if (property.getBroker() == null ||
                property.getBroker().getId() == null ||
                !property.getBroker().getId().equals(brokerId)) {

            throw new BrokerResourceNotFoundException(
                    "Property does not belong to this broker"
            );
        }
    }

    /**
     * Convert Property entity to PropertyResponse.
     */
    private PropertyResponse mapToResponse(Property property) {

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
                .sellerId(
                        property.getSeller() != null
                                ? property.getSeller().getId()
                                : null
                )
                .brokerId(
                        property.getBroker() != null
                                ? property.getBroker().getId()
                                : null
                )
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
