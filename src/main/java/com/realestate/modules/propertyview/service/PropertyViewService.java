package com.realestate.modules.propertyview.service;

import com.realestate.modules.property.dto.response.PropertyResponse;

import java.util.List;

public interface PropertyViewService {

void recordView(Long propertyId);

long getViewCount(Long propertyId);

List<PropertyResponse> getMyViewedProperties();
}
