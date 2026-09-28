package com.realestate.modules.messaging.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {

  private Long id;

  private Long buyerId;
  private String buyerName;

  private Long sellerId;
  private String sellerName;

  private Long propertyId;
  private String propertyTitle;

  private LocalDateTime createdAt;
}