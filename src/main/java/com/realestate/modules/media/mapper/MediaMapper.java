package com.realestate.modules.media.mapper;

import com.realestate.modules.media.dto.request.CreateMediaRequest;
import com.realestate.modules.media.dto.response.MediaResponse;
import com.realestate.modules.media.entity.Media;
import com.realestate.modules.property.entity.Property;
import org.springframework.stereotype.Component;

@Component
public class MediaMapper {

  public Media toEntity(CreateMediaRequest request, Property property) {

    return Media.builder()
        .fileName(request.getFileName())
        .fileUrl(request.getFileUrl())
        .mediaType(request.getMediaType())
        .primary(request.getPrimary() != null && request.getPrimary())
        .property(property)
        .build();
  }

  public MediaResponse toResponse(Media media) {

    return MediaResponse.builder()
        .id(media.getId())
        .fileName(media.getFileName())
        .fileUrl(media.getFileUrl())
        .mediaType(media.getMediaType())
        .primary(media.getPrimary())
        .propertyId(media.getProperty().getId())
        .build();
  }
}