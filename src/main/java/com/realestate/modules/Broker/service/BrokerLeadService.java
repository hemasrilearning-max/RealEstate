
package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerLeadDTO;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.lead.entity.Lead;
import com.realestate.modules.lead.enums.LeadStatus;
import com.realestate.modules.lead.repository.LeadRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Broker leads - uses shared {@code leads} table (same as lead module).
 * Filtered by leads.broker_id = brokerId.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerLeadService {

    private final LeadRepository leadRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public BrokerLeadDTO createLead(Long brokerId, BrokerLeadDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Lead data is required");
        }

        if (dto.getPropertyId() == null) {
            throw new IllegalArgumentException("propertyId is required");
        }

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }

        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Broker not found: " + brokerId));

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Property not found: " + dto.getPropertyId()));

        User seller = property.getSeller();

        if (seller == null) {
            throw new BrokerResourceNotFoundException(
                    "Property has no seller/owner");
        }

        User buyer = null;

        if (dto.getBuyerId() != null) {
            buyer = userRepository.findById(dto.getBuyerId())
                    .orElseThrow(() -> new BrokerResourceNotFoundException(
                            "Buyer not found: " + dto.getBuyerId()));
        }

        LeadStatus status = parseStatus(dto.getStatus());

        Lead lead = Lead.builder()
                .buyer(buyer)
                .property(property)
                .seller(seller)
                .broker(broker)
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .message(dto.getMessage())
                .status(status != null ? status : LeadStatus.NEW)
                .build();

        // Lead.buyer is non-null in entity - require buyerId for create
        if (buyer == null) {
            throw new IllegalArgumentException(
                    "buyerId is required (user with role BUYER)");
        }

        return mapToDTO(leadRepository.save(lead));
    }

    /**
     * Get all leads belonging to a broker.
     */
    @Transactional(readOnly = true)
    public List<BrokerLeadDTO> getAllLeadsByBroker(Long brokerId) {
        return leadRepository.findByBrokerIdOrderByCreatedAtDesc(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get the most recent leads belonging to a broker.
     *
     * Example:
     * getRecentLeads(9L, 5)
     *
     * Returns the latest 5 leads for broker 9.
     */
    @Transactional(readOnly = true)
    public List<BrokerLeadDTO> getRecentLeads(Long brokerId, int limit) {

        if (limit <= 0) {
            limit = 5;
        }

        return leadRepository.findByBrokerIdOrderByCreatedAtDesc(brokerId)
                .stream()
                .limit(limit)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get paginated leads for a broker.
     */
    @Transactional(readOnly = true)
    public Page<BrokerLeadDTO> getLeadsByBrokerPaged(
            Long brokerId,
            int page,
            int size) {

        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        List<BrokerLeadDTO> all = getAllLeadsByBroker(brokerId);

        int start = Math.min(page * size, all.size());
        int end = Math.min(start + size, all.size());

        return new PageImpl<>(
                all.subList(start, end),
                PageRequest.of(page, size),
                all.size());
    }

    /**
     * Get a specific lead belonging to a broker.
     */
    @Transactional(readOnly = true)
    public BrokerLeadDTO getLeadById(Long brokerId, Long leadId) {
        Lead lead = getLeadForBroker(brokerId, leadId);
        return mapToDTO(lead);
    }

    /**
     * Update a lead.
     */
    public BrokerLeadDTO updateLead(
            Long brokerId,
            Long leadId,
            BrokerLeadDTO dto) {

        Lead lead = getLeadForBroker(brokerId, leadId);

        if (dto.getName() != null && !dto.getName().isBlank()) {
            lead.setName(dto.getName());
        }

        if (dto.getEmail() != null) {
            lead.setEmail(dto.getEmail());
        }

        if (dto.getPhone() != null) {
            lead.setPhone(dto.getPhone());
        }

        if (dto.getMessage() != null) {
            lead.setMessage(dto.getMessage());
        }

        if (dto.getStatus() != null) {
            LeadStatus status = parseStatus(dto.getStatus());

            if (status != null) {
                lead.setStatus(status);
            }
        }

        return mapToDTO(leadRepository.save(lead));
    }

    /**
     * Update lead status.
     */
    public BrokerLeadDTO updateLeadStatus(
            Long brokerId,
            Long leadId,
            String statusValue) {

        Lead lead = getLeadForBroker(brokerId, leadId);

        LeadStatus status = parseStatus(statusValue);

        if (status == null) {
            throw new IllegalArgumentException(
                    "Invalid status. Use: NEW, CONTACTED, IN_PROGRESS, CONVERTED, CLOSED");
        }

        lead.setStatus(status);

        return mapToDTO(leadRepository.save(lead));
    }

    /**
     * Delete a lead.
     */
    public void deleteLead(Long brokerId, Long leadId) {
        Lead lead = getLeadForBroker(brokerId, leadId);
        leadRepository.delete(lead);
    }

    /**
     * Find a lead and verify that it belongs to the broker.
     */
    private Lead getLeadForBroker(Long brokerId, Long leadId) {

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new BrokerResourceNotFoundException(
                        "Lead not found: " + leadId));

        Long leadBrokerId = lead.getBroker() != null
                ? lead.getBroker().getId()
                : null;

        if (leadBrokerId == null || !brokerId.equals(leadBrokerId)) {

            // Also allow if property is assigned to this broker.
            boolean propertyMatch =
                    lead.getProperty() != null
                    && lead.getProperty().getBroker() != null
                    && brokerId.equals(
                            lead.getProperty().getBroker().getId());

            if (!propertyMatch) {
                throw new BrokerResourceNotFoundException(
                        "Lead does not belong to this broker");
            }
        }

        return lead;
    }

    /**
     * Parse lead status safely.
     */
    private LeadStatus parseStatus(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LeadStatus.valueOf(
                    value.trim().toUpperCase(Locale.ROOT));

        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Convert Lead entity to BrokerLeadDTO.
     */
    private BrokerLeadDTO mapToDTO(Lead lead) {

        Long buyerId = null;
        String buyerName = null;

        if (lead.getBuyer() != null) {
            buyerId = lead.getBuyer().getId();
            buyerName = formatName(lead.getBuyer());
        }

        Long propertyId = null;
        String propertyTitle = null;

        if (lead.getProperty() != null) {
            propertyId = lead.getProperty().getId();
            propertyTitle = lead.getProperty().getTitle();
        }

        Long sellerId = null;
        String sellerName = null;

        if (lead.getSeller() != null) {
            sellerId = lead.getSeller().getId();
            sellerName = formatName(lead.getSeller());
        }

        Long brokerId = null;

        if (lead.getBroker() != null) {
            brokerId = lead.getBroker().getId();
        }

        return BrokerLeadDTO.builder()
                .id(lead.getId())
                .buyerId(buyerId)
                .buyerName(buyerName)
                .propertyId(propertyId)
                .propertyTitle(propertyTitle)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .brokerId(brokerId)
                .name(lead.getName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .message(lead.getMessage())
                .status(
                        lead.getStatus() != null
                                ? lead.getStatus().name()
                                : null)
                .createdAt(lead.getCreatedAt())
                .build();
    }

    /**
     * Format user's first and last name.
     */
    private String formatName(User user) {

        if (user == null) {
            return null;
        }

        String first =
                user.getFirstName() != null
                        ? user.getFirstName()
                        : "";

        String last =
                user.getLastName() != null
                        ? user.getLastName()
                        : "";

        return (first + " " + last).trim();
    }
}

