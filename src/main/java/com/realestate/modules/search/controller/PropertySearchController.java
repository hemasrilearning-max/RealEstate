package com.realestate.modules.search.controller;

import com.realestate.modules.search.dto.request.PropertySearchRequest;
import com.realestate.modules.search.dto.response.PropertySearchResponse;
import com.realestate.modules.search.service.PropertySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class PropertySearchController {

  private final PropertySearchService propertySearchService;

  @GetMapping("/properties")
  public ResponseEntity<List<PropertySearchResponse>> searchProperties(
      @ModelAttribute PropertySearchRequest request) {

    List<PropertySearchResponse> response = propertySearchService.searchProperties(request);

    return ResponseEntity.ok(response);
  }
}