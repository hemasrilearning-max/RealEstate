package com.realestate.modules.property.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.security.AuthenticatedUserService;
import com.realestate.modules.location.entity.Location;
import com.realestate.modules.location.repository.LocationRepository;
import com.realestate.modules.media.repository.MediaRepository;
import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.mapper.PropertyMapper;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.property.service.PropertyService;
import com.realestate.modules.propertyview.service.PropertyViewService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

  private final PropertyRepository propertyRepository;
  private final UserRepository userRepository;
  private final LocationRepository locationRepository;
  private final PropertyMapper propertyMapper;
  private final AuthenticatedUserService authenticatedUserService;

  // Media repository used when deleting a property
  private final MediaRepository mediaRepository;

  // Property view service
  private final PropertyViewService propertyViewService;

  // ============================================================
  // CREATE PROPERTY
  // ============================================================

  @Override
  @Transactional
  public PropertyResponse createProperty(CreatePropertyRequest request) {

    // Get currently logged-in user from JWT
    User seller = authenticatedUserService.getCurrentUser();

    // Only SELLER can create properties
    if (seller.getRole().getName() != RoleType.SELLER) {
      throw new AccessDeniedException(
          "Only SELLER users can create properties");
    }

    // Find location
    Location location = locationRepository.findById(request.getLocationId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Location not found with id: "
                + request.getLocationId()));

    // Create property
    Property property = propertyMapper.toEntity(
        request,
        seller,
        location);

    // Set the user who actually created the property
    property.setCreatedBy(seller);

    // ==========================================================
    // SET BROKER
    // ==========================================================

    if (request.getBrokerId() != null) {

      User broker = userRepository.findById(request.getBrokerId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Broker not found with id: "
                  + request.getBrokerId()));

      // Make sure selected user is actually a BROKER
      if (broker.getRole() == null
          || broker.getRole().getName() != RoleType.BROKER) {

        throw new IllegalArgumentException(
            "Selected user is not a BROKER");
      }

      property.setBroker(broker);

    } else {

      // No broker selected
      property.setBroker(null);
    }

    // Save property
    Property savedProperty = propertyRepository.save(property);

    return propertyMapper.toResponse(savedProperty);
  }

  // ============================================================
  // GET PROPERTY BY ID
  // ============================================================

  @Override
  @Transactional
  public PropertyResponse getPropertyById(Long id) {

    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

    // Record unique buyer view
    propertyViewService.recordView(id);

    return propertyMapper.toResponse(property);
  }

  // ============================================================
  // GET ALL PROPERTIES
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<PropertyResponse> getAllProperties() {

    return propertyRepository.findAll()
        .stream()
        .map(propertyMapper::toResponse)
        .toList();
  }

  // ============================================================
  // GET PROPERTIES BY SELLER
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<PropertyResponse> getPropertiesBySeller(Long sellerId) {

    // Check whether seller exists
    User seller = userRepository.findById(sellerId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Seller not found with id: " + sellerId));

    // Check whether the user is actually a SELLER
    if (seller.getRole().getName() != RoleType.SELLER) {
      throw new IllegalArgumentException(
          "User with id " + sellerId + " is not a SELLER");
    }

    return propertyRepository.findBySeller_Id(sellerId)
        .stream()
        .map(propertyMapper::toResponse)
        .toList();
  }

  // ============================================================
  // UPDATE PROPERTY
  // ============================================================

  @Override
  @Transactional
  public PropertyResponse updateProperty(
      Long id,
      UpdatePropertyRequest request) {

    // Find property
    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

    // Check whether the logged-in user owns this property
    validatePropertyOwnership(property);

    // Update title
    if (request.getTitle() != null) {
      property.setTitle(request.getTitle());
    }

    // Update description
    if (request.getDescription() != null) {
      property.setDescription(request.getDescription());
    }

    // Update price
    if (request.getPrice() != null) {
      property.setPrice(request.getPrice());
    }

    // Update bedrooms
    if (request.getBedrooms() != null) {
      property.setBedrooms(request.getBedrooms());
    }

    // Update bathrooms
    if (request.getBathrooms() != null) {
      property.setBathrooms(request.getBathrooms());
    }

    // Update area
    if (request.getArea() != null) {
      property.setArea(request.getArea());
    }

    // Update property type
    if (request.getPropertyType() != null) {
      property.setPropertyType(request.getPropertyType());
    }

    // Update listing type
    if (request.getListingType() != null) {
      property.setListingType(request.getListingType());
    }

    // Update furnishing status
    if (request.getFurnishingStatus() != null) {
      property.setFurnishingStatus(
          request.getFurnishingStatus());
    }

    // Update ownership type
    if (request.getOwnershipType() != null) {
      property.setOwnershipType(
          request.getOwnershipType());
    }

    // ==========================================================
    // UPDATE BROKER
    // ==========================================================

    if (request.getBrokerId() != null) {

      User broker = userRepository.findById(request.getBrokerId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Broker not found with id: "
                  + request.getBrokerId()));

      // Make sure selected user is actually a BROKER
      if (broker.getRole() == null
          || broker.getRole().getName() != RoleType.BROKER) {

        throw new IllegalArgumentException(
            "Selected user is not a BROKER");
      }

      property.setBroker(broker);

    } else {

      // No broker selected
      property.setBroker(null);
    }

    // Update location
    if (request.getLocationId() != null) {

      Location location = locationRepository
          .findById(request.getLocationId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Location not found with id: "
                  + request.getLocationId()));

      property.setLocation(location);
    }

    // Save updated property
    Property updatedProperty = propertyRepository.save(property);

    return propertyMapper.toResponse(updatedProperty);
  }

  // ============================================================
  // DELETE PROPERTY
  // ============================================================

  @Override
  @Transactional
  public void deleteProperty(Long id) {

    // Find property
    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

    // Check whether the logged-in user owns this property
    validatePropertyOwnership(property);

    // ----------------------------------------------------------
    // DELETE MEDIA FIRST
    // ----------------------------------------------------------
    //
    // media.property_id references properties.id.
    // Therefore media records must be removed before
    // deleting the property.
    //

    mediaRepository.deleteByPropertyId(id);

    // ----------------------------------------------------------
    // DELETE PROPERTY
    // ----------------------------------------------------------

    propertyRepository.delete(property);
  }

  // ============================================================
  // PROPERTY OWNERSHIP VALIDATION
  // ============================================================

  private void validatePropertyOwnership(Property property) {

    // Get currently logged-in user from JWT
    User currentUser = authenticatedUserService.getCurrentUser();

    // Only SELLER can modify properties
    if (currentUser.getRole().getName() != RoleType.SELLER) {
      throw new AccessDeniedException(
          "Only SELLER users can modify properties");
    }

    // Check whether this property belongs to the
    // currently logged-in seller
    if (!property.getSeller()
        .getId()
        .equals(currentUser.getId())) {

      throw new AccessDeniedException(
          "You are not authorized to modify this property");
    }
  }
}
