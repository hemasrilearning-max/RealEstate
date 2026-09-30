package com.realestate.modules.media.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.security.AuthenticatedUserService;
import com.realestate.modules.media.dto.response.MediaResponse;
import com.realestate.modules.media.entity.Media;
import com.realestate.modules.media.enums.MediaType;
import com.realestate.modules.media.mapper.MediaMapper;
import com.realestate.modules.media.repository.MediaRepository;
import com.realestate.modules.media.service.MediaService;
import com.realestate.modules.media.service.MediaStorageService;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

  private final MediaRepository mediaRepository;
  private final PropertyRepository propertyRepository;
  private final MediaMapper mediaMapper;
  private final MediaStorageService mediaStorageService;
  private final AuthenticatedUserService authenticatedUserService;

  // ============================================================
  // UPLOAD MEDIA
  // ============================================================

  @Override
  @Transactional
  public MediaResponse uploadMedia(
      MultipartFile file,
      Long propertyId,
      MediaType mediaType,
      Boolean primary) {

    // Find property
    Property property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + propertyId));

    // Verify that the logged-in user owns this property
    validatePropertyOwnership(property);

    // Store file
    String fileUrl = mediaStorageService.storeFile(
        file,
        propertyId);

    // Create Media entity
    Media media = Media.builder()
        .fileName(file.getOriginalFilename())
        .fileUrl(fileUrl)
        .mediaType(mediaType)
        .primary(primary != null && primary)
        .property(property)
        .build();

    // Save media
    Media savedMedia = mediaRepository.save(media);

    return mediaMapper.toResponse(savedMedia);
  }

  // ============================================================
  // GET MEDIA BY ID
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public MediaResponse getMediaById(Long id) {

    Media media = mediaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Media not found with id: " + id));

    return mediaMapper.toResponse(media);
  }

  // ============================================================
  // GET MEDIA BY PROPERTY
  // ============================================================

  @Override
  @Transactional(readOnly = true)
  public List<MediaResponse> getMediaByProperty(Long propertyId) {

    // Check whether property exists
    if (!propertyRepository.existsById(propertyId)) {
      throw new ResourceNotFoundException(
          "Property not found with id: " + propertyId);
    }

    return mediaRepository.findByPropertyId(propertyId)
        .stream()
        .map(mediaMapper::toResponse)
        .toList();
  }

  // ============================================================
  // DELETE MEDIA
  // ============================================================

  @Override
  @Transactional
  public void deleteMedia(Long id) {

    // Find media
    Media media = mediaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Media not found with id: " + id));

    // Get property associated with this media
    Property property = media.getProperty();

    // Verify that the logged-in user owns the property
    validatePropertyOwnership(property);

    // Delete physical file
    mediaStorageService.deleteFile(
        media.getFileUrl());

    // Delete database record
    mediaRepository.delete(media);
  }

  // ============================================================
  // PROPERTY OWNERSHIP VALIDATION
  // ============================================================

  private void validatePropertyOwnership(Property property) {

    // Get currently logged-in user from JWT
    User currentUser = authenticatedUserService.getCurrentUser();

    // Only SELLER can upload/delete property media
    if (currentUser.getRole().getName() != RoleType.SELLER) {
      throw new AccessDeniedException(
          "Only SELLER users can manage property media");
    }

    // Check whether property belongs to logged-in seller
    if (!property.getSeller()
        .getId()
        .equals(currentUser.getId())) {

      throw new AccessDeniedException(
          "You are not authorized to manage media for this property");
    }
  }
}