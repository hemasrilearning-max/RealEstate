package com.realestate.modules.user.service.impl;

import com.realestate.common.exception.ResourceNotFoundException;
import com.realestate.modules.user.dto.request.ChangePasswordRequest;
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
import com.realestate.modules.user.service.UserProfileStorageService;
import com.realestate.modules.user.service.UserService;
import com.realestate.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticatedUserService authenticatedUserService;

    private final UserProfileStorageService userProfileStorageService;

    // =========================
    // CREATE USER
    // =========================

    @Override
    public UserResponse createUser(
            CreateUserRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists");
        }

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists");
        }

        RoleType roleType = request.getRole();

        Role role = roleRepository
                .findByName(roleType)
                .orElseThrow(() -> new RuntimeException(
                        "Role not found: "
                                + roleType));

        User user = userMapper.toEntity(request, role);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

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
                        "User not found with id: "
                                + id));

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
                        "User not found with id: "
                                + id));

        if (request.getEmail() != null
                && !request.getEmail()
                        .equals(user.getEmail())) {

            if (userRepository.existsByEmail(
                    request.getEmail())) {

                throw new RuntimeException(
                        "Email already exists");
            }

            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {

            user.setFirstName(
                    request.getFirstName());
        }

        if (request.getLastName() != null) {

            user.setLastName(
                    request.getLastName());
        }

        if (request.getPhone() != null) {

            user.setPhone(
                    request.getPhone());
        }

        if (request.getAccountType() != null) {

            user.setAccountType(
                    request.getAccountType());
        }

        if (request.getRole() != null) {

            Role role = roleRepository
                    .findByName(
                            request.getRole())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Role not found: "
                                    + request.getRole()));

            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(
                updatedUser);
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
                        "User not found with id: "
                                + id));

        user.setStatus(
                request.getStatus());

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(
                updatedUser);
    }

    // =========================
    // DELETE USER
    // =========================

    @Override
    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: "
                                + id));

        if (user.getProfilePhotoPath() != null) {

            userProfileStorageService
                    .deleteProfilePhoto(
                            user.getProfilePhotoPath());
        }

        userRepository.delete(user);
    }

    // =========================
    // UPLOAD PROFILE PHOTO
    // =========================

    @Override
    @Transactional
    public UserResponse uploadProfilePhoto(
            MultipartFile file) {

        User currentUser = authenticatedUserService
                .getCurrentUser();

        // Delete old photo first
        if (currentUser.getProfilePhotoPath() != null) {

            userProfileStorageService
                    .deleteProfilePhoto(
                            currentUser
                                    .getProfilePhotoPath());
        }

        String filePath = userProfileStorageService
                .storeProfilePhoto(
                        currentUser.getId(),
                        file);

        currentUser.setProfilePhotoPath(
                filePath);

        User savedUser = userRepository.save(currentUser);

        return userMapper.toResponse(
                savedUser);
    }

    // =========================
    // DELETE PROFILE PHOTO
    // =========================

    @Override
    @Transactional
    public void deleteProfilePhoto() {

        User currentUser = authenticatedUserService
                .getCurrentUser();

        if (currentUser.getProfilePhotoPath() != null) {

            userProfileStorageService
                    .deleteProfilePhoto(
                            currentUser
                                    .getProfilePhotoPath());

            currentUser.setProfilePhotoPath(
                    null);

            userRepository.save(currentUser);
        }
    }

    // =========================
    // GET PROFILE PHOTO
    // =========================

    @Override
    @Transactional(readOnly = true)
    public byte[] getProfilePhoto(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: "
                                + userId));

        if (user.getProfilePhotoPath() == null) {

            throw new ResourceNotFoundException(
                    "Profile photo not found");
        }

        return userProfileStorageService
                .loadProfilePhoto(
                        user.getProfilePhotoPath());
    }

    // =========================
    // CHANGE PASSWORD
    // =========================

    @Override
    @Transactional
    public void changePassword(
            ChangePasswordRequest request) {

        User currentUser = authenticatedUserService
                .getCurrentUser();

        // Check current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                currentUser.getPassword())) {

            throw new RuntimeException(
                    "Current password is incorrect");
        }

        // Check if new password is same
        // as current password
        if (passwordEncoder.matches(
                request.getNewPassword(),
                currentUser.getPassword())) {

            throw new RuntimeException(
                    "New password must be different from current password");
        }

        // Encode new password
        String encodedPassword = passwordEncoder.encode(
                request.getNewPassword());

        currentUser.setPassword(
                encodedPassword);

        userRepository.save(currentUser);
    }
}