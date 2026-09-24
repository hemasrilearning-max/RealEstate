
package com.realestate.modules.property.dto.response;

import com.realestate.modules.location.dto.response.LocationResponse;
import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
import com.realestate.modules.property.enums.OwnershipType;
import com.realestate.modules.property.enums.PropertyStatus;
import com.realestate.modules.property.enums.PropertyType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {

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

  private OwnershipType ownershipType;

  private LocationResponse location;

  private Long sellerId;
  private String sellerName;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}