package com.realestate.modules.search.service;

import com.realestate.modules.search.dto.request.PropertySearchRequest;
import com.realestate.modules.search.dto.response.PropertySearchResponse;

import java.util.List;

public interface PropertySearchService {

  List<PropertySearchResponse> searchProperties(
      PropertySearchRequest request);
}