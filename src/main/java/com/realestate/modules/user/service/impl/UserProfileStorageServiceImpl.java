package com.realestate.modules.user.service.impl;

import com.realestate.modules.user.service.UserProfileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class UserProfileStorageServiceImpl
    implements UserProfileStorageService {

  private static final String BASE_DIRECTORY = "uploads/users";

  @Override
  public String storeProfilePhoto(
      Long userId,
      MultipartFile file) {

    if (file == null || file.isEmpty()) {
      throw new RuntimeException(
          "Profile photo is required");
    }

    String contentType = file.getContentType();

    if (contentType == null ||
        (!contentType.equals("image/jpeg")
            && !contentType.equals("image/png")
            && !contentType.equals("image/webp"))) {

      throw new RuntimeException(
          "Only JPG, PNG and WEBP images are allowed");
    }

    try {

      Path directory = Paths.get(
          BASE_DIRECTORY,
          String.valueOf(userId),
          "profile");

      Files.createDirectories(directory);

      String originalFilename = file.getOriginalFilename();

      String extension = "";

      if (originalFilename != null &&
          originalFilename.contains(".")) {

        extension = originalFilename.substring(
            originalFilename.lastIndexOf("."));
      }

      String filename = UUID.randomUUID() + extension;

      Path filePath = directory.resolve(filename);

      Files.write(
          filePath,
          file.getBytes(),
          StandardOpenOption.CREATE,
          StandardOpenOption.TRUNCATE_EXISTING);

      return filePath.toString();

    } catch (IOException e) {

      throw new RuntimeException(
          "Failed to store profile photo",
          e);
    }
  }

  @Override
  public void deleteProfilePhoto(
      String filePath) {

    if (filePath == null) {
      return;
    }

    try {

      Files.deleteIfExists(
          Paths.get(filePath));

    } catch (IOException e) {

      throw new RuntimeException(
          "Failed to delete profile photo",
          e);
    }
  }

  @Override
  public byte[] loadProfilePhoto(
      String filePath) {

    if (filePath == null) {
      throw new RuntimeException(
          "Profile photo not found");
    }

    try {

      return Files.readAllBytes(
          Paths.get(filePath));

    } catch (IOException e) {

      throw new RuntimeException(
          "Failed to read profile photo",
          e);
    }
  }
}