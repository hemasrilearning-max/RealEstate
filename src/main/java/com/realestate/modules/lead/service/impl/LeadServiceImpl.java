
package com.realestate.modules.lead.service.impl;

import com.realestate.modules.lead.dto.request.CreateLeadRequest;
import com.realestate.modules.lead.dto.response.LeadResponse;
import com.realestate.modules.lead.entity.Lead;
import com.realestate.modules.lead.enums.LeadStatus;
import com.realestate.modules.lead.mapper.LeadMapper;
import com.realestate.modules.lead.repository.LeadRepository;
import com.realestate.modules.lead.service.LeadService;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.security.AuthenticatedUserService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadServiceImpl implements LeadService {

  private final LeadRepository leadRepository;
  private final PropertyRepository propertyRepository;
  private final LeadMapper leadMapper;
  private final AuthenticatedUserService authenticatedUserService;

  @Override
  public LeadResponse createLead(CreateLeadRequest request) {

    // Get the currently logged-in user from JWT
    User buyer = authenticatedUserService.getCurrentUser();

    // Only BUYER can create a lead
    if (buyer.getRole() == null ||
        buyer.getRole().getName() != RoleType.BUYER) {

      throw new RuntimeException(
          "Only a buyer can create a property lead");
    }

    // Find the property
    Property property = propertyRepository.findById(request.getPropertyId())
        .orElseThrow(() -> new RuntimeException(
            "Property not found with ID: "
                + request.getPropertyId()));

    // Get seller from the property
    User seller = property.getSeller();

    if (seller == null) {
      throw new RuntimeException(
          "Seller is not assigned to this property");
    }

    // Get broker assigned to the property
    // Can be null if no broker is assigned
    User broker = property.getBroker();

    // Create lead
    Lead lead = Lead.builder()
        .buyer(buyer)
        .property(property)
        .seller(seller)
        .broker(broker)
        .name(request.getName())
        .email(request.getEmail())
        .phone(request.getPhone())
        .message(request.getMessage())
        .status(LeadStatus.NEW)
        .build();

    Lead savedLead = leadRepository.save(lead);

    return leadMapper.toResponse(savedLead);
  }

  @Override
  @Transactional(readOnly = true)
  public LeadResponse getLeadById(Long leadId) {

    Lead lead = findLeadById(leadId);

    return leadMapper.toResponse(lead);
  }

  @Override
  @Transactional(readOnly = true)
  public List<LeadResponse> getMyLeads() {

    User currentUser = authenticatedUserService.getCurrentUser();

    return leadRepository
        .findByBuyerIdOrderByCreatedAtDesc(currentUser.getId())
        .stream()
        .map(leadMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<LeadResponse> getLeadsBySeller(Long sellerId) {

    return leadRepository
        .findBySellerIdOrderByCreatedAtDesc(sellerId)
        .stream()
        .map(leadMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<LeadResponse> getLeadsByBroker(Long brokerId) {

    return leadRepository
        .findByBrokerIdOrderByCreatedAtDesc(brokerId)
        .stream()
        .map(leadMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<LeadResponse> getLeadsByProperty(Long propertyId) {

    return leadRepository
        .findByPropertyIdOrderByCreatedAtDesc(propertyId)
        .stream()
        .map(leadMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<LeadResponse> getLeadsByStatus(LeadStatus status) {

    return leadRepository
        .findByStatusOrderByCreatedAtDesc(status)
        .stream()
        .map(leadMapper::toResponse)
        .toList();
  }

  /*
   * =========================================================
   * GET LEAD COUNT FOR PROPERTY
   * =========================================================
   */
  @Override
  @Transactional(readOnly = true)
  public long getLeadCount(Long propertyId) {

    if (!propertyRepository.existsById(propertyId)) {
      throw new RuntimeException(
          "Property not found with ID: " + propertyId);
    }

    return leadRepository.countByPropertyId(propertyId);
  }

  @Override
  public LeadResponse updateLeadStatus(
      Long leadId,
      LeadStatus status) {

    Lead lead = findLeadById(leadId);

    lead.setStatus(status);

    Lead updatedLead = leadRepository.save(lead);

    return leadMapper.toResponse(updatedLead);
  }

  @Override
  public void deleteLead(Long leadId) {

    Lead lead = findLeadById(leadId);

    leadRepository.delete(lead);
  }

  private Lead findLeadById(Long leadId) {

    return leadRepository.findById(leadId)
        .orElseThrow(() -> new RuntimeException(
            "Lead not found with ID: " + leadId));
  }
}

