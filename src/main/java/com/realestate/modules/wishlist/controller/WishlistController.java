package com.realestate.modules.wishlist.controller;

import com.realestate.modules.wishlist.dto.request.AddWishlistRequest;
import com.realestate.modules.wishlist.dto.response.WishlistResponse;
import com.realestate.modules.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

  private final WishlistService wishlistService;

  @PostMapping
  public ResponseEntity<WishlistResponse> addToWishlist(
      @Valid @RequestBody AddWishlistRequest request) {

    WishlistResponse response = wishlistService.addToWishlist(request);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<WishlistResponse>> getWishlistByUser(
      @PathVariable Long userId) {

    List<WishlistResponse> response = wishlistService.getWishlistByUser(userId);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/check")
  public ResponseEntity<Boolean> checkWishlist(
      @RequestParam Long userId,
      @RequestParam Long propertyId) {

    boolean wishlisted = wishlistService.isPropertyWishlisted(
        userId,
        propertyId);

    return ResponseEntity.ok(wishlisted);
  }

  @DeleteMapping
  public ResponseEntity<Void> removeFromWishlist(
      @RequestParam Long userId,
      @RequestParam Long propertyId) {

    wishlistService.removeFromWishlist(
        userId,
        propertyId);

    return ResponseEntity.noContent().build();
  }
}