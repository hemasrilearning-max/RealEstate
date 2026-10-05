package com.realestate.modules.lead.service;

import com.realestate.modules.lead.dto.request.CreateLeadRequest;
import com.realestate.modules.lead.dto.response.LeadResponse;
import com.realestate.modules.lead.enums.LeadStatus;

import java.util.List;

public interface LeadService {

  LeadResponse createLead(CreateLeadRequest request);

  LeadResponse getLeadById(Long leadId);

  List<LeadResponse> getMyLeads();

  List<LeadResponse> getLeadsBySeller(Long sellerId);

  List<LeadResponse> getLeadsByBroker(Long brokerId);

  List<LeadResponse> getLeadsByProperty(Long propertyId);

  List<LeadResponse> getLeadsByStatus(LeadStatus status);

  LeadResponse updateLeadStatus(Long leadId, LeadStatus status);

  void deleteLead(Long leadId);
}