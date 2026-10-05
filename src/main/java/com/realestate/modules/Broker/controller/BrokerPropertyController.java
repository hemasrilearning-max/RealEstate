package com.realestate.modules.Broker.controller;

import com.realestate.modules.Broker.dto.BrokerApiResponse;
import com.realestate.modules.Broker.service.BrokerPropertyService;
import com.realestate.modules.property.dto.request.CreatePropertyRequest;
import com.realestate.modules.property.dto.request.UpdatePropertyRequest;
import com.realestate.modules.property.dto.response.PropertyResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/broker/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BrokerPropertyController {

    private final BrokerPropertyService propertyService;

    /**
     * Create a new property for a broker.
     */
    @PostMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<PropertyResponse>> create(
            @PathVariable Long brokerId,
            @RequestBody CreatePropertyRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        BrokerApiResponse.success(
                                "Property created",
                                propertyService.createProperty(brokerId, request)
                        )
                );
    }

    /**
     * Get all properties belonging to a broker.
     */
    @GetMapping("/{brokerId}")
    public ResponseEntity<BrokerApiResponse<List<PropertyResponse>>> getAll(
            @PathVariable Long brokerId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        propertyService.getAllPropertiesByBroker(brokerId)
                )
        );
    }

    /**
     * Get paginated properties belonging to a broker.
     */
    @GetMapping("/{brokerId}/paged")
    public ResponseEntity<BrokerApiResponse<Page<PropertyResponse>>> getPaged(
            @PathVariable Long brokerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        propertyService.getPropertiesByBrokerPaged(
                                brokerId,
                                page,
                                size
                        )
                )
        );
    }

    /**
     * Get a single property belonging to a broker.
     */
    @GetMapping("/{brokerId}/{propertyId}")
    public ResponseEntity<BrokerApiResponse<PropertyResponse>> getOne(
            @PathVariable Long brokerId,
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        propertyService.getPropertyById(
                                brokerId,
                                propertyId
                        )
                )
        );
    }

    /**
     * Update a broker's property.
     */
    @PutMapping("/{brokerId}/{propertyId}")
    public ResponseEntity<BrokerApiResponse<PropertyResponse>> update(
            @PathVariable Long brokerId,
            @PathVariable Long propertyId,
            @RequestBody UpdatePropertyRequest request) {

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Property updated",
                        propertyService.updateProperty(
                                brokerId,
                                propertyId,
                                request
                        )
                )
        );
    }

    /**
     * Delete a broker's property.
     */
    @DeleteMapping("/{brokerId}/{propertyId}")
    public ResponseEntity<BrokerApiResponse<Void>> delete(
            @PathVariable Long brokerId,
            @PathVariable Long propertyId) {

        propertyService.deleteProperty(
                brokerId,
                propertyId
        );

        return ResponseEntity.ok(
                BrokerApiResponse.success(
                        "Property deleted",
                        null
                )
        );
    }
}