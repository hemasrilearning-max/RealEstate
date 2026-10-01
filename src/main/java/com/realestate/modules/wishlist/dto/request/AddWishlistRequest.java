package com.realestate.modules.wishlist.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddWishlistRequest {

  @NotNull(message = "Property ID is required")
  private Long propertyId;
}