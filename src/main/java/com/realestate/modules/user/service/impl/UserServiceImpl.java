package com.realestate.modules.user.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.modules.user.dto.request.ChangeUserStatusRequest;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.request.UpdateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;
import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.mapper.UserMapper;
import com.realestate.modules.user.repository.RoleRepository;
import com.realestate.modules.user.repository.UserRepository;
import com.realestate.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserMapper userMapper;

  // =========================
  // CREATE USER
  // =========================

  @Override
  @Transactional
  public UserResponse createUser(CreateUserRequest request) {

    if (userRepository.existsByEmail(request.getEmail())) {
      throw new RuntimeException("Email already exists");
    }

    RoleType roleType = request.getRole();

    Role role = roleRepository.findByName(roleType)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Role not found: " + roleType));

    User user = userMapper.toEntity(request, role);

    User savedUser = userRepository.save(user);

    return userMapper.toResponse(savedUser);
  }

  // =========================
  // GET USER BY ID
  // =========================

  @Override
  @Transactional(readOnly = true)
  public UserResponse getUserById(Long id) {

    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "User not found with id: " + id));

    return userMapper.toResponse(user);
  }

  // =========================
  // GET ALL USERS
  // =========================

  @Override
  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsers() {

    return userRepository.findAll()
        .stream()
        .map(userMapper::toResponse)
        .toList();
  }

  // =========================
  // UPDATE USER
  // =========================

  @Override
  @Transactional
  public UserResponse updateUser(
      Long id,
      UpdateUserRequest request) {

    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "User not found with id: " + id));

    // Update email only if a new email is provided
    if (request.getEmail() != null
        && !request.getEmail().equals(user.getEmail())) {

      if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already exists");
      }

      user.setEmail(request.getEmail());
    }

    if (request.getFirstName() != null) {
      user.setFirstName(request.getFirstName());
    }

    if (request.getLastName() != null) {
      user.setLastName(request.getLastName());
    }

    if (request.getPhone() != null) {
      user.setPhone(request.getPhone());
    }

    if (request.getAccountType() != null) {
      user.setAccountType(request.getAccountType());
    }

    if (request.getRole() != null) {

      Role role = roleRepository.findByName(request.getRole())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Role not found: " + request.getRole()));

      user.setRole(role);
    }

    User updatedUser = userRepository.save(user);

    return userMapper.toResponse(updatedUser);
  }

  // =========================
  // CHANGE USER STATUS
  // =========================

  @Override
  @Transactional
  public UserResponse changeUserStatus(
      Long id,
      ChangeUserStatusRequest request) {

    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "User not found with id: " + id));

    user.setStatus(request.getStatus());

    User updatedUser = userRepository.save(user);

    return userMapper.toResponse(updatedUser);
  }

  // =========================
  // DELETE USER
  // =========================

  @Override
  @Transactional
  public void deleteUser(Long id) {

    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "User not found with id: " + id));

    userRepository.delete(user);
  }
}