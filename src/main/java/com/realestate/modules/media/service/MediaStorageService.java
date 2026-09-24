package com.realestate.modules.media.service;

import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {

  String storeFile(MultipartFile file, Long propertyId);

  void deleteFile(String fileUrl);
}