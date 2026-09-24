package com.realestate.modules.user.service;

import com.realestate.modules.user.dto.request.ChangeUserStatusRequest;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.request.UpdateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;

import java.util.List;

public interface UserService {

  UserResponse createUser(CreateUserRequest request);

  UserResponse getUserById(Long id);

  List<UserResponse> getAllUsers();

  UserResponse updateUser(Long id, UpdateUserRequest request);

  UserResponse changeUserStatus(Long id, ChangeUserStatusRequest request);

  void deleteUser(Long id);
}