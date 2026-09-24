package com.realestate.modules.property.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.modules.location.entity.Location;
import com.realestate.modules.location.repository.LocationRepository;
import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.mapper.PropertyMapper;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.property.service.PropertyService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

  @Override
  @Transactional
  public PropertyResponse createProperty(CreatePropertyRequest request) {

    User seller = userRepository.findById(request.getSellerId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Seller not found with id: " + request.getSellerId()));

    if (seller.getRole().getName() != RoleType.SELLER) {
      throw new IllegalArgumentException(
          "User with id " + request.getSellerId()
              + " is not a SELLER");
    }

    Location location = locationRepository.findById(request.getLocationId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Location not found with id: "
                + request.getLocationId()));

    Property property = propertyMapper.toEntity(request, seller, location);

    Property savedProperty = propertyRepository.save(property);

    return propertyMapper.toResponse(savedProperty);
  }

  @Override
  @Transactional(readOnly = true)
  public PropertyResponse getPropertyById(Long id) {

    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

    return propertyMapper.toResponse(property);
  }

  @Override
  @Transactional(readOnly = true)
  public List<PropertyResponse> getAllProperties() {

    return propertyRepository.findAll()
        .stream()
        .map(propertyMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PropertyResponse> getPropertiesBySeller(Long sellerId) {

    // Check whether seller exists
    User seller = userRepository.findById(sellerId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Seller not found with id: " + sellerId));

    // Check whether the user is actually a seller
    if (seller.getRole().getName() != RoleType.SELLER) {
      throw new IllegalArgumentException(
          "User with id " + sellerId + " is not a SELLER");
    }

    return propertyRepository.findBySellerId(sellerId)
        .stream()
        .map(propertyMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional
  public PropertyResponse updateProperty(
      Long id,
      UpdatePropertyRequest request) {

    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

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

    if (request.getFurnishingStatus() != null) {
      property.setFurnishingStatus(request.getFurnishingStatus());
    }

    if (request.getOwnershipType() != null) {
      property.setOwnershipType(request.getOwnershipType());
    }

    if (request.getLocationId() != null) {

      Location location = locationRepository
          .findById(request.getLocationId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Location not found with id: "
                  + request.getLocationId()));

      property.setLocation(location);
    }

    Property updatedProperty = propertyRepository.save(property);

    return propertyMapper.toResponse(updatedProperty);
  }

  @Override
  @Transactional
  public void deleteProperty(Long id) {

    Property property = propertyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + id));

    propertyRepository.delete(property);
  }
}