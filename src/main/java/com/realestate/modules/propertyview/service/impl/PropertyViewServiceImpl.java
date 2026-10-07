package com.realestate.modules.propertyview.service.impl;

import com.realestate.modules.property.dto.response.PropertyResponse;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.mapper.PropertyMapper;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.propertyview.entity.PropertyView;
import com.realestate.modules.propertyview.repository.PropertyViewRepository;
import com.realestate.modules.propertyview.service.PropertyViewService;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyViewServiceImpl implements PropertyViewService {

private final PropertyViewRepository propertyViewRepository;

private final PropertyRepository propertyRepository;

private final PropertyMapper propertyMapper;

private final AuthenticatedUserService authenticatedUserService;

// =========================================================
// RECORD PROPERTY VIEW
// =========================================================

@Override
@Transactional
public void recordView(Long propertyId) {


Property property = propertyRepository.findById(propertyId)
    .orElseThrow(() -> new RuntimeException(
        "Property not found with id: " + propertyId));

User currentUser = authenticatedUserService.getCurrentUser();

// Only BUYER views are counted
if (currentUser.getRole() == null
    || currentUser.getRole().getName() != RoleType.BUYER) {

  return;
}

// Do not count the same buyer twice
boolean alreadyViewed = propertyViewRepository
    .existsByPropertyIdAndUserId(
        propertyId,
        currentUser.getId());

if (alreadyViewed) {
  return;
}

PropertyView propertyView = PropertyView.builder()
    .property(property)
    .user(currentUser)
    .build();

propertyViewRepository.save(propertyView);

}

// =========================================================
// GET VIEW COUNT
// =========================================================

@Override
@Transactional(readOnly = true)
public long getViewCount(Long propertyId) {


if (!propertyRepository.existsById(propertyId)) {
  throw new RuntimeException(
      "Property not found with id: " + propertyId);
}

return propertyViewRepository.countByPropertyId(propertyId);


}

// =========================================================
// GET CURRENT BUYER'S VIEWED PROPERTIES
// =========================================================

@Override
@Transactional(readOnly = true)
public List<PropertyResponse> getMyViewedProperties() {


User currentUser = authenticatedUserService.getCurrentUser();

// Only BUYERS have viewed-property history
if (currentUser.getRole() == null
    || currentUser.getRole().getName() != RoleType.BUYER) {

  return List.of();
}

return propertyViewRepository
    .findByUserIdOrderByViewedAtDesc(currentUser.getId())
    .stream()
    .map(PropertyView::getProperty)
    .map(propertyMapper::toResponse)
    .toList();


}
}
