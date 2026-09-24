package com.realestate.modules.search.dto.request;

import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
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
public class PropertySearchRequest {

  private String city;

  private String area;

  private String pincode;

  private PropertyType propertyType;

  private ListingType listingType;

  private BigDecimal minPrice;

  private BigDecimal maxPrice;

  private Integer minBedrooms;

  private Integer maxBedrooms;

  private Integer minBathrooms;

  private Integer maxBathrooms;

  private BigDecimal minArea;

  private BigDecimal maxArea;

  private FurnishingStatus furnishingStatus;
}