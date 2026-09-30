package com.realestate.modules.user.service;

import org.springframework.web.multipart.MultipartFile;

public interface UserProfileStorageService {

  String storeProfilePhoto(
      Long userId,
      MultipartFile file);

  void deleteProfilePhoto(String filePath);

  byte[] loadProfilePhoto(String filePath);
}