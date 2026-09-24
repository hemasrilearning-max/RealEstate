package com.realestate.modules.wishlist.service;

import com.realestate.modules.wishlist.dto.request.AddWishlistRequest;
import com.realestate.modules.wishlist.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {

  WishlistResponse addToWishlist(AddWishlistRequest request);

  List<WishlistResponse> getWishlistByUser(Long userId);

  boolean isPropertyWishlisted(Long userId, Long propertyId);

  void removeFromWishlist(Long userId, Long propertyId);
}