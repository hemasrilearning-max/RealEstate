package com.realestate.modules.propertyview.controller;

import com.realestate.modules.propertyview.service.PropertyViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/property-views")
@RequiredArgsConstructor
public class PropertyViewController {

  private final PropertyViewService propertyViewService;

  // =========================================================
  // GET VIEW COUNT
  // =========================================================

  @GetMapping("/property/{propertyId}/count")
  public ResponseEntity<Long> getViewCount(
      @PathVariable Long propertyId) {

    long count = propertyViewService.getViewCount(propertyId);

    return ResponseEntity.ok(count);
  }
}