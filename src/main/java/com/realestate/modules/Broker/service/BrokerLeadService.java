package com.realestate.modules.Broker.service;

import com.realestate.modules.Broker.dto.BrokerLeadDTO;
import com.realestate.modules.Broker.entity.BrokerLead;
import com.realestate.modules.Broker.exception.BrokerResourceNotFoundException;
import com.realestate.modules.Broker.repository.BrokerLeadRepository;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Broker Lead Service
 *
 * brokerId = users.id where role = BROKER
 *
 * Leads can optionally be associated with a Property.
 * Property is the common Property entity from the property module.
 *
 * There is NO BrokerProperty entity/table.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BrokerLeadService {

    private final BrokerLeadRepository leadRepository;

    /**
     * Uses the common PropertyRepository.
     * This accesses the existing "properties" table.
     */
    private final PropertyRepository propertyRepository;


    /**
     * Create a new lead for a broker.
     */
    public BrokerLeadDTO createLead(Long brokerId, BrokerLeadDTO dto) {

        Property property = null;

        if (dto.getPropertyId() != null) {

            property = propertyRepository.findById(dto.getPropertyId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Property not found with id: " + dto.getPropertyId()
                            )
                    );
        }

        BrokerLead lead = BrokerLead.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .message(dto.getMessage())
                .status(
                        dto.getStatus() != null
                                ? dto.getStatus()
                                : BrokerLead.LeadStatus.NEW
                )
                .source(dto.getSource())
                .property(property)
                .brokerId(brokerId)
                .isActive(true)
                .build();

        return mapToDTO(leadRepository.save(lead));
    }


    /**
     * Get all leads belonging to a broker.
     */
    @Transactional(readOnly = true)
    public List<BrokerLeadDTO> getAllLeadsByBroker(Long brokerId) {

        return leadRepository.findByBrokerId(brokerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    /**
     * Get paginated leads belonging to a broker.
     */
    @Transactional(readOnly = true)
    public Page<BrokerLeadDTO> getLeadsByBrokerPaged(
            Long brokerId,
            int page,
            int size
    ) {

        return leadRepository
                .findByBrokerId(
                        brokerId,
                        PageRequest.of(page, size)
                )
                .map(this::mapToDTO);
    }


    /**
     * Get recent leads for a broker.
     */
    @Transactional(readOnly = true)
    public List<BrokerLeadDTO> getRecentLeads(
            Long brokerId,
            int limit
    ) {

        return leadRepository
                .findByBrokerIdOrderByCreatedAtDesc(
                        brokerId,
                        PageRequest.of(0, limit)
                )
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    /**
     * Get a particular lead belonging to the broker.
     */
    @Transactional(readOnly = true)
    public BrokerLeadDTO getLeadById(
            Long brokerId,
            Long leadId
    ) {

        BrokerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Lead not found with id: " + leadId
                        )
                );

        validateBrokerOwnership(lead, brokerId);

        return mapToDTO(lead);
    }


    /**
     * Update lead status.
     */
    public BrokerLeadDTO updateLeadStatus(
            Long brokerId,
            Long leadId,
            BrokerLead.LeadStatus status
    ) {

        BrokerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Lead not found with id: " + leadId
                        )
                );

        validateBrokerOwnership(lead, brokerId);

        lead.setStatus(status);

        if (status == BrokerLead.LeadStatus.CLOSED
                || status == BrokerLead.LeadStatus.LOST
                || status == BrokerLead.LeadStatus.WON) {

            lead.setActive(false);
        }

        return mapToDTO(leadRepository.save(lead));
    }


    /**
     * Update an existing lead.
     */
    public BrokerLeadDTO updateLead(
            Long brokerId,
            Long leadId,
            BrokerLeadDTO dto
    ) {

        BrokerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Lead not found with id: " + leadId
                        )
                );

        validateBrokerOwnership(lead, brokerId);


        if (dto.getName() != null) {
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
            lead.setStatus(dto.getStatus());
        }

        if (dto.getSource() != null) {
            lead.setSource(dto.getSource());
        }

        if (dto.isActive() != lead.isActive()) {
            lead.setActive(dto.isActive());
        }


        /**
         * Update associated property.
         *
         * IMPORTANT:
         * This uses the common Property entity/table.
         */
        if (dto.getPropertyId() != null) {

            Property property = propertyRepository
                    .findById(dto.getPropertyId())
                    .orElseThrow(() ->
                            new BrokerResourceNotFoundException(
                                    "Property not found with id: "
                                            + dto.getPropertyId()
                            )
                    );

            lead.setProperty(property);
        }

        return mapToDTO(leadRepository.save(lead));
    }


    /**
     * Delete a lead belonging to the broker.
     */
    public void deleteLead(
            Long brokerId,
            Long leadId
    ) {

        BrokerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() ->
                        new BrokerResourceNotFoundException(
                                "Lead not found with id: " + leadId
                        )
                );

        validateBrokerOwnership(lead, brokerId);

        leadRepository.delete(lead);
    }


    /**
     * Validate that the lead belongs to the logged-in broker.
     */
    private void validateBrokerOwnership(
            BrokerLead lead,
            Long brokerId
    ) {

        if (lead.getBrokerId() == null
                || !lead.getBrokerId().equals(brokerId)) {

            throw new BrokerResourceNotFoundException(
                    "Lead does not belong to this broker"
            );
        }
    }


    /**
     * Convert entity to DTO.
     */
    private BrokerLeadDTO mapToDTO(BrokerLead lead) {

        return BrokerLeadDTO.builder()
                .id(lead.getId())
                .name(lead.getName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .message(lead.getMessage())
                .status(lead.getStatus())
                .source(lead.getSource())

                .propertyId(
                        lead.getProperty() != null
                                ? lead.getProperty().getId()
                                : null
                )

                .propertyTitle(
                        lead.getProperty() != null
                                ? lead.getProperty().getTitle()
                                : null
                )

                .brokerId(lead.getBrokerId())
                .isActive(lead.isActive())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}