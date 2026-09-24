package com.realestate.modules.search.dto.response;

import com.realestate.modules.location.dto.response.LocationResponse;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertySearchResponse {

  private Long id;

  private String title;

  private String description;

  private BigDecimal price;

  private Integer bedrooms;

  private Integer bathrooms;

  private BigDecimal area;

  private PropertyType propertyType;

  private ListingType listingType;

  private PropertyStatus status;

  private FurnishingStatus furnishingStatus;

  private LocationResponse location;

  private Long sellerId;

  private String sellerName;
}