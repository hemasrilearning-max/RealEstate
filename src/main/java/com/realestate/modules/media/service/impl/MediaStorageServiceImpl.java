package com.realestate.modules.media.service.impl;

import com.realestate.modules.media.service.MediaStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MediaStorageServiceImpl implements MediaStorageService {

  private final Path uploadDirectory = Paths.get("uploads/properties");

  @Override
  public String storeFile(MultipartFile file, Long propertyId) {

    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File cannot be empty");
    }

    try {
      Path propertyDirectory = uploadDirectory.resolve(
          String.valueOf(propertyId));

      Files.createDirectories(propertyDirectory);

      String originalFileName = file.getOriginalFilename();

      if (originalFileName == null || originalFileName.isBlank()) {
        throw new IllegalArgumentException("Invalid file name");
      }

      String extension = "";

      int dotIndex = originalFileName.lastIndexOf(".");

      if (dotIndex > 0) {
        extension = originalFileName.substring(dotIndex);
      }

      String uniqueFileName = UUID.randomUUID() + extension;

      Path targetFile = propertyDirectory.resolve(uniqueFileName);

      Files.copy(
          file.getInputStream(),
          targetFile,
          StandardCopyOption.REPLACE_EXISTING);

      return "/uploads/properties/"
          + propertyId
          + "/"
          + uniqueFileName;

    } catch (IOException e) {

      throw new RuntimeException(
          "Failed to store file: " + e.getMessage(),
          e);
    }
  }

  @Override
  public void deleteFile(String fileUrl) {

    if (fileUrl == null || fileUrl.isBlank()) {
      return;
    }

    try {
      String relativePath = fileUrl.startsWith("/")
          ? fileUrl.substring(1)
          : fileUrl;

      Path filePath = Paths.get(relativePath);

      Files.deleteIfExists(filePath);

    } catch (IOException e) {

      throw new RuntimeException(
          "Failed to delete file: " + e.getMessage(),
          e);
    }
  }
}