package com.realestate.modules.propertyview.controller;

import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.propertyview.service.PropertyViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/property-views")
@RequiredArgsConstructor
public class PropertyViewController {

private final PropertyViewService propertyViewService;

// =========================================================
// RECORD PROPERTY VIEW
// =========================================================

@PostMapping("/property/{propertyId}")
public ResponseEntity<Void> recordView(
@PathVariable Long propertyId) {


propertyViewService.recordView(propertyId);

return ResponseEntity.noContent().build();


}

// =========================================================
// GET CURRENT BUYER'S VIEWED PROPERTIES
// =========================================================

@GetMapping("/my")
public ResponseEntity<List<PropertyResponse>> getMyViewedProperties() {


return ResponseEntity.ok(
    propertyViewService.getMyViewedProperties()
);


}

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
