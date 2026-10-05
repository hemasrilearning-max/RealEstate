package com.realestate.modules.lead.mapper;

import com.realestate.modules.lead.dto.response.LeadResponse;
import com.realestate.modules.lead.entity.Lead;
import org.springframework.stereotype.Component;

@Component
public class LeadMapper {

  public LeadResponse toResponse(Lead lead) {

    String buyerName = buildFullName(
        lead.getBuyer().getFirstName(),
        lead.getBuyer().getLastName());

    String sellerName = buildFullName(
        lead.getSeller().getFirstName(),
        lead.getSeller().getLastName());

    String brokerName = null;

    if (lead.getBroker() != null) {
      brokerName = buildFullName(
          lead.getBroker().getFirstName(),
          lead.getBroker().getLastName());
    }

    return LeadResponse.builder()
        .id(lead.getId())

        .buyerId(lead.getBuyer().getId())
        .buyerName(buyerName)

        .propertyId(lead.getProperty().getId())
        .propertyTitle(lead.getProperty().getTitle())

        .sellerId(lead.getSeller().getId())
        .sellerName(sellerName)

        .brokerId(
            lead.getBroker() != null
                ? lead.getBroker().getId()
                : null)
        .brokerName(brokerName)

        .name(lead.getName())
        .email(lead.getEmail())
        .phone(lead.getPhone())
        .message(lead.getMessage())

        .status(lead.getStatus())
        .createdAt(lead.getCreatedAt())

        .build();
  }

  private String buildFullName(String firstName, String lastName) {

    String first = firstName != null ? firstName : "";
    String last = lastName != null ? lastName : "";

    return (first + " " + last).trim();
  }
}