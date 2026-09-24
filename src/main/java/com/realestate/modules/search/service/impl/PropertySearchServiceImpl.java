package com.realestate.modules.search.service.impl;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.search.dto.request.PropertySearchRequest;
import com.realestate.modules.search.dto.response.PropertySearchResponse;
import com.realestate.modules.search.service.PropertySearchService;
import com.realestate.modules.search.specification.PropertySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertySearchServiceImpl implements PropertySearchService {

  private final PropertyRepository propertyRepository;

  @Override
  @Transactional(readOnly = true)
  public List<PropertySearchResponse> searchProperties(
      PropertySearchRequest request) {

    Specification<Property> specification = PropertySpecification.filterBy(request);

    List<Property> properties = propertyRepository.findAll(specification);

    return properties.stream()
        .map(this::mapToResponse)
        .toList();
  }

  private PropertySearchResponse mapToResponse(Property property) {

    return PropertySearchResponse.builder()
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
        .location(
            property.getLocation() != null
                ? com.realestate.modules.location.dto.response.LocationResponse.builder()
                    .id(property.getLocation().getId())
                    .country(property.getLocation().getCountry())
                    .state(property.getLocation().getState())
                    .city(property.getLocation().getCity())
                    .area(property.getLocation().getArea())
                    .pincode(property.getLocation().getPincode())
                    .address(property.getLocation().getAddress())
                    .build()
                : null)
        .sellerId(property.getSeller().getId())
        .sellerName(
            property.getSeller().getFirstName()
                + " "
                + property.getSeller().getLastName())
        .build();
  }
}