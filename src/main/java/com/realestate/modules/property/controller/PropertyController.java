package com.realestate.modules.property.controller;

import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @RequestBody CreatePropertyRequest request) {

        PropertyResponse response = propertyService.createProperty(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                propertyService.getPropertyById(id));
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties() {

        return ResponseEntity.ok(
                propertyService.getAllProperties());
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesBySeller(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                propertyService.getPropertiesBySeller(sellerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePropertyRequest request) {

        return ResponseEntity.ok(
                propertyService.updateProperty(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id) {

        propertyService.deleteProperty(id);

        return ResponseEntity.noContent().build();
    }
}