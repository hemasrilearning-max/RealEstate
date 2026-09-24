package com.realestate.modules.wishlist.mapper;

import com.realestate.modules.wishlist.dto.response.WishlistResponse;
import com.realestate.modules.wishlist.entity.Wishlist;
import org.springframework.stereotype.Component;

@Component
public class WishlistMapper {

  public WishlistResponse toResponse(Wishlist wishlist) {

    return WishlistResponse.builder()
        .id(wishlist.getId())
        .userId(wishlist.getUser().getId())
        .propertyId(wishlist.getProperty().getId())
        .propertyTitle(wishlist.getProperty().getTitle())
        .propertyPrice(wishlist.getProperty().getPrice())
        .propertyType(wishlist.getProperty().getPropertyType())
        .listingType(wishlist.getProperty().getListingType())
        .propertyStatus(wishlist.getProperty().getStatus())
        .furnishingStatus(
            wishlist.getProperty().getFurnishingStatus())
        .city(
            wishlist.getProperty().getLocation() != null
                ? wishlist.getProperty().getLocation().getCity()
                : null)
        .area(
            wishlist.getProperty().getLocation() != null
                ? wishlist.getProperty().getLocation().getArea()
                : null)
        .createdAt(wishlist.getCreatedAt())
        .build();
  }
}