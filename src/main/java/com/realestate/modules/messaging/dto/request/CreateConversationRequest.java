package com.realestate.modules.messaging.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

  @NotNull(message = "Buyer ID is required")
  private Long buyerId;

  @NotNull(message = "Seller ID is required")
  private Long sellerId;

  @NotNull(message = "Property ID is required")
  private Long propertyId;
}