package com.realestate.modules.wishlist.service.impl;

import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import com.realestate.modules.wishlist.dto.request.AddWishlistRequest;
import com.realestate.modules.wishlist.dto.response.WishlistResponse;
import com.realestate.modules.wishlist.entity.Wishlist;
import com.realestate.modules.wishlist.mapper.WishlistMapper;
import com.realestate.modules.wishlist.repository.WishlistRepository;
import com.realestate.modules.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

  private final WishlistRepository wishlistRepository;
  private final UserRepository userRepository;
  private final PropertyRepository propertyRepository;
  private final WishlistMapper wishlistMapper;

  @Override
  @Transactional
  public WishlistResponse addToWishlist(AddWishlistRequest request) {

    if (wishlistRepository.existsByUserIdAndPropertyId(
        request.getUserId(),
        request.getPropertyId())) {

      throw new IllegalArgumentException(
          "Property is already in the wishlist");
    }

    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new IllegalArgumentException(
            "User not found with ID: "
                + request.getUserId()));

    Property property = propertyRepository.findById(
        request.getPropertyId()).orElseThrow(
            () -> new IllegalArgumentException(
                "Property not found with ID: "
                    + request.getPropertyId()));

    Wishlist wishlist = Wishlist.builder()
        .user(user)
        .property(property)
        .build();

    Wishlist savedWishlist = wishlistRepository.save(wishlist);

    return wishlistMapper.toResponse(savedWishlist);
  }

  @Override
  @Transactional(readOnly = true)
  public List<WishlistResponse> getWishlistByUser(Long userId) {

    return wishlistRepository.findByUserId(userId)
        .stream()
        .map(wishlistMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public boolean isPropertyWishlisted(
      Long userId,
      Long propertyId) {

    return wishlistRepository.existsByUserIdAndPropertyId(
        userId,
        propertyId);
  }

  @Override
  @Transactional
  public void removeFromWishlist(
      Long userId,
      Long propertyId) {

    if (!wishlistRepository.existsByUserIdAndPropertyId(
        userId,
        propertyId)) {

      throw new IllegalArgumentException(
          "Property is not in the wishlist");
    }

    wishlistRepository.deleteByUserIdAndPropertyId(
        userId,
        propertyId);
  }
}