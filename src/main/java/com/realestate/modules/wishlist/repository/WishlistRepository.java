package com.realestate.modules.wishlist.repository;

import com.realestate.modules.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

  List<Wishlist> findByUserId(Long userId);

  Optional<Wishlist> findByUserIdAndPropertyId(
      Long userId,
      Long propertyId);

  boolean existsByUserIdAndPropertyId(
      Long userId,
      Long propertyId);

  void deleteByUserIdAndPropertyId(
      Long userId,
      Long propertyId);
}