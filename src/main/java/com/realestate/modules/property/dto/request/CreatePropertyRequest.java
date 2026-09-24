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
public class CreatePropertyRequest {

  @NotBlank(message = "Title is required")
  @Size(max = 200, message = "Title must not exceed 200 characters")
  private String title;

  @Size(max = 2000, message = "Description must not exceed 2000 characters")
  private String description;

  @NotNull(message = "Price is required")
  @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
  private BigDecimal price;

  @NotNull(message = "Bedrooms are required")
  @Min(value = 0, message = "Bedrooms cannot be negative")
  private Integer bedrooms;

  @NotNull(message = "Bathrooms are required")
  @Min(value = 0, message = "Bathrooms cannot be negative")
  private Integer bathrooms;

  @NotNull(message = "Area is required")
  @DecimalMin(value = "0.0", inclusive = false, message = "Area must be greater than 0")
  private BigDecimal area;

  @NotNull(message = "Property type is required")
  private PropertyType propertyType;

  @NotNull(message = "Listing type is required")
  private ListingType listingType;

  private FurnishingStatus furnishingStatus;

  private OwnershipType ownershipType;

  @NotNull(message = "Location ID is required")
  private Long locationId;

  @NotNull(message = "Seller ID is required")
  private Long sellerId;
}