package com.realestate.modules.media.controller;

import com.realestate.modules.media.dto.response.MediaResponse;
import com.realestate.modules.media.enums.MediaType;
import com.realestate.modules.media.service.MediaService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;

  @PostMapping(value = "/property/{propertyId}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<MediaResponse> uploadMedia(
      @PathVariable Long propertyId,

      @RequestParam("file") @NotNull MultipartFile file,

      @RequestParam("mediaType") MediaType mediaType,

      @RequestParam(value = "primary", defaultValue = "false") Boolean primary) {

    MediaResponse response = mediaService.uploadMedia(
        file,
        propertyId,
        mediaType,
        primary);

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<MediaResponse> getMediaById(
      @PathVariable Long id) {

    return ResponseEntity.ok(
        mediaService.getMediaById(id));
  }

  @GetMapping("/property/{propertyId}")
  public ResponseEntity<List<MediaResponse>> getMediaByProperty(
      @PathVariable Long propertyId) {

    return ResponseEntity.ok(
        mediaService.getMediaByProperty(propertyId));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteMedia(
      @PathVariable Long id) {

    mediaService.deleteMedia(id);

    return ResponseEntity.noContent().build();
  }
}