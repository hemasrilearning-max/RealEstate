package com.realestate.modules.user.mapper;

import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;
import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public User toEntity(CreateUserRequest request, Role role) {

    return User.builder()
        .firstName(request.getFirstName())
        .lastName(request.getLastName())
        .email(request.getEmail())
        .password(request.getPassword())
        .phone(request.getPhone())
        .role(role)
        .accountType(request.getAccountType())
        .build();
  }

  public UserResponse toResponse(User user) {

    return UserResponse.builder()
        .id(user.getId())
        .firstName(user.getFirstName())
        .lastName(user.getLastName())
        .email(user.getEmail())
        .phone(user.getPhone())
        .role(user.getRole().getName())
        .status(user.getStatus())
        .accountType(user.getAccountType())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }
}