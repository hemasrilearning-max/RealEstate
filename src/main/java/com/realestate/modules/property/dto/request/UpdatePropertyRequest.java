package com.realestate.modules.property.dto.request;

import com.realestate.modules.property.enums.FurnishingStatus;
import com.realestate.modules.property.enums.ListingType;
import com.realestate.modules.property.enums.OwnershipType;
import com.realestate.modules.property.enums.PropertyType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePropertyRequest {

  @Size(max = 200, message = "Title must not exceed 200 characters")
  private String title;

  @Size(max = 2000, message = "Description must not exceed 2000 characters")
  private String description;

  @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
  private BigDecimal price;

  @Min(value = 0, message = "Bedrooms cannot be negative")
  private Integer bedrooms;

  @Min(value = 0, message = "Bathrooms cannot be negative")
  private Integer bathrooms;

  @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than 0")
  private BigDecimal area;

  private PropertyType propertyType;

  private ListingType listingType;

  private FurnishingStatus furnishingStatus;

  private OwnershipType ownershipType;

  private Long locationId;
}
