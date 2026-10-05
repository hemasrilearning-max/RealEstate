package com.realestate.modules.lead.controller;

import com.realestate.modules.lead.dto.request.CreateLeadRequest;
import com.realestate.modules.lead.dto.response.LeadResponse;
import com.realestate.modules.lead.enums.LeadStatus;
import com.realestate.modules.lead.service.LeadService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

  private final LeadService leadService;

  // Buyer submits "I'm Interested"
  @PostMapping
  public ResponseEntity<LeadResponse> createLead(
      @Valid @RequestBody CreateLeadRequest request) {

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(leadService.createLead(request));
  }

  // Get a specific lead
  @GetMapping("/{leadId}")
  public ResponseEntity<LeadResponse> getLeadById(
      @PathVariable Long leadId) {

    return ResponseEntity.ok(
        leadService.getLeadById(leadId));
  }

  // Logged-in buyer's leads
  @GetMapping("/my")
  public ResponseEntity<List<LeadResponse>> getMyLeads() {

    return ResponseEntity.ok(
        leadService.getMyLeads());
  }

  // Seller's leads
  @GetMapping("/seller/{sellerId}")
  public ResponseEntity<List<LeadResponse>> getLeadsBySeller(
      @PathVariable Long sellerId) {

    return ResponseEntity.ok(
        leadService.getLeadsBySeller(sellerId));
  }

  // Broker's leads
  @GetMapping("/broker/{brokerId}")
  public ResponseEntity<List<LeadResponse>> getLeadsByBroker(
      @PathVariable Long brokerId) {

    return ResponseEntity.ok(
        leadService.getLeadsByBroker(brokerId));
  }

  // Leads for a particular property
  @GetMapping("/property/{propertyId}")
  public ResponseEntity<List<LeadResponse>> getLeadsByProperty(
      @PathVariable Long propertyId) {

    return ResponseEntity.ok(
        leadService.getLeadsByProperty(propertyId));
  }

  // Leads by status
  @GetMapping("/status/{status}")
  public ResponseEntity<List<LeadResponse>> getLeadsByStatus(
      @PathVariable LeadStatus status) {

    return ResponseEntity.ok(
        leadService.getLeadsByStatus(status));
  }

  // Update lead status
  @PatchMapping("/{leadId}/status")
  public ResponseEntity<LeadResponse> updateLeadStatus(
      @PathVariable Long leadId,
      @RequestParam LeadStatus status) {

    return ResponseEntity.ok(
        leadService.updateLeadStatus(leadId, status));
  }

  // Delete lead
  @DeleteMapping("/{leadId}")
  public ResponseEntity<Void> deleteLead(
      @PathVariable Long leadId) {

    leadService.deleteLead(leadId);

    return ResponseEntity.noContent().build();
  }
}