package com.realestate.modules.lead.dto.response;

import com.realestate.modules.lead.enums.LeadStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadResponse {

  private Long id;

  private Long buyerId;
  private String buyerName;

  private Long propertyId;
  private String propertyTitle;

  private Long sellerId;
  private String sellerName;

  private Long brokerId;
  private String brokerName;

  private String name;
  private String email;
  private String phone;
  private String message;

  private LeadStatus status;

  private LocalDateTime createdAt;
}