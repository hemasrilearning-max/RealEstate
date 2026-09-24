package com.realestate.modules.media.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.modules.media.dto.response.MediaResponse;
import com.realestate.modules.media.entity.Media;
import com.realestate.modules.media.enums.MediaType;
import com.realestate.modules.media.mapper.MediaMapper;
import com.realestate.modules.media.repository.MediaRepository;
import com.realestate.modules.media.service.MediaService;
import com.realestate.modules.media.service.MediaStorageService;
import com.realestate.modules.property.entity.Property;
import com.realestate.modules.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
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

  @Override
  @Transactional
  public MediaResponse uploadMedia(
      MultipartFile file,
      Long propertyId,
      MediaType mediaType,
      Boolean primary) {

    Property property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Property not found with id: " + propertyId));

    String fileUrl = mediaStorageService.storeFile(
        file,
        propertyId);

    Media media = Media.builder()
        .fileName(file.getOriginalFilename())
        .fileUrl(fileUrl)
        .mediaType(mediaType)
        .primary(primary != null && primary)
        .property(property)
        .build();

    Media savedMedia = mediaRepository.save(media);

    return mediaMapper.toResponse(savedMedia);
  }

  @Override
  @Transactional(readOnly = true)
  public MediaResponse getMediaById(Long id) {

    Media media = mediaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Media not found with id: " + id));

    return mediaMapper.toResponse(media);
  }

  @Override
  @Transactional(readOnly = true)
  public List<MediaResponse> getMediaByProperty(Long propertyId) {

    if (!propertyRepository.existsById(propertyId)) {
      throw new ResourceNotFoundException(
          "Property not found with id: " + propertyId);
    }

    return mediaRepository.findByPropertyId(propertyId)
        .stream()
        .map(mediaMapper::toResponse)
        .toList();
  }

  @Override
  @Transactional
  public void deleteMedia(Long id) {

    Media media = mediaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Media not found with id: " + id));

    mediaStorageService.deleteFile(media.getFileUrl());

    mediaRepository.delete(media);
  }
}