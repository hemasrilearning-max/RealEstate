package com.realestate.modules.propertyview.repository;

import com.realestate.modules.propertyview.entity.PropertyView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropertyViewRepository
extends JpaRepository<PropertyView, Long> {

boolean existsByPropertyIdAndUserId(
Long propertyId,
Long userId);

long countByPropertyId(Long propertyId);

Optional<PropertyView> findByPropertyIdAndUserId(
Long propertyId,
Long userId);

List<PropertyView> findByUserIdOrderByViewedAtDesc(
Long userId);
}
