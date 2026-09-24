package com.realestate.modules.media.service;

import com.realestate.modules.media.dto.response.MediaResponse;
import com.realestate.modules.media.enums.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {

  MediaResponse uploadMedia(
      MultipartFile file,
      Long propertyId,
      MediaType mediaType,
      Boolean primary);

  MediaResponse getMediaById(Long id);

  List<MediaResponse> getMediaByProperty(Long propertyId);

  void deleteMedia(Long id);
}