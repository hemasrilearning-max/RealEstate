package com.realestate.modules.propertyview.service;

public interface PropertyViewService {

  void recordView(Long propertyId);

  long getViewCount(Long propertyId);
}