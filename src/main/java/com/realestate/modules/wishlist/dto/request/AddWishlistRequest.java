package com.realestate.modules.wishlist.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddWishlistRequest {

  @NotNull(message = "User ID is required")
  private Long userId;

  @NotNull(message = "Property ID is required")
  private Long propertyId;
}