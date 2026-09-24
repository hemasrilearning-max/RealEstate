package com.realestate.modules.wishlist.dto.response;

import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
import com.realestate.modules.property.enums.PropertyStatus;
import com.realestate.modules.property.enums.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

  private Long id;

  private Long userId;

  private Long propertyId;

  private String propertyTitle;

  private BigDecimal propertyPrice;

  private PropertyType propertyType;

  private ListingType listingType;

  private PropertyStatus propertyStatus;

  private FurnishingStatus furnishingStatus;

  private String city;

  private String area;

  private LocalDateTime createdAt;
}