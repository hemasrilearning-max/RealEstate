package com.realestate.modules.user.service;

import com.realestate.modules.user.dto.request.ChangePasswordRequest;
import com.realestate.modules.user.dto.request.ChangeUserStatusRequest;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.request.UpdateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

  UserResponse createUser(CreateUserRequest request);

  UserResponse getUserById(Long id);

  List<UserResponse> getAllUsers();

  UserResponse updateUser(
      Long id,
      UpdateUserRequest request);

  UserResponse changeUserStatus(
      Long id,
      ChangeUserStatusRequest request);

  void deleteUser(Long id);

  UserResponse uploadProfilePhoto(MultipartFile file);

  void deleteProfilePhoto();

  byte[] getProfilePhoto(Long userId);

  void changePassword(ChangePasswordRequest request);
}