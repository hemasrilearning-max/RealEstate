package com.realestate.modules.property.service;

import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;

import java.util.List;

public interface PropertyService {

  PropertyResponse createProperty(CreatePropertyRequest request);

  PropertyResponse getPropertyById(Long id);

  List<PropertyResponse> getAllProperties();

  List<PropertyResponse> getPropertiesBySeller(Long sellerId);

  PropertyResponse updateProperty(Long id, UpdatePropertyRequest request);

  void deleteProperty(Long id);
}