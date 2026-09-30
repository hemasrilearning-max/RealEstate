package com.realestate.modules.user.controller;

import com.realestate.modules.user.dto.request.ChangePasswordRequest;
import com.realestate.modules.user.dto.request.ChangeUserStatusRequest;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.request.UpdateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;
import com.realestate.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;

        // =========================
        // CREATE USER
        // =========================

        @PostMapping
        public ResponseEntity<UserResponse> createUser(
                        @Valid @RequestBody CreateUserRequest request) {

                UserResponse response = userService.createUser(request);

                return ResponseEntity
                                .status(201)
                                .body(response);
        }

        // =========================
        // GET USER BY ID
        // =========================

        @GetMapping("/{id}")
        public ResponseEntity<UserResponse> getUserById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                userService.getUserById(id));
        }

        // =========================
        // GET ALL USERS
        // =========================

        @GetMapping
        public ResponseEntity<List<UserResponse>> getAllUsers() {

                return ResponseEntity.ok(
                                userService.getAllUsers());
        }

        // =========================
        // UPDATE USER
        // =========================

        @PutMapping("/{id}")
        public ResponseEntity<UserResponse> updateUser(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateUserRequest request) {

                return ResponseEntity.ok(
                                userService.updateUser(
                                                id,
                                                request));
        }

        // =========================
        // CHANGE USER STATUS
        // =========================

        @PatchMapping("/{id}/status")
        public ResponseEntity<UserResponse> changeUserStatus(
                        @PathVariable Long id,
                        @Valid @RequestBody ChangeUserStatusRequest request) {

                return ResponseEntity.ok(
                                userService.changeUserStatus(
                                                id,
                                                request));
        }

        // =========================
        // DELETE USER
        // =========================

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteUser(
                        @PathVariable Long id) {

                userService.deleteUser(id);

                return ResponseEntity
                                .noContent()
                                .build();
        }

        // =========================
        // UPLOAD PROFILE PHOTO
        // =========================

        @PostMapping(value = "/me/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<UserResponse> uploadProfilePhoto(
                        @RequestParam("file") MultipartFile file) {

                return ResponseEntity.ok(
                                userService.uploadProfilePhoto(file));
        }

        // =========================
        // DELETE PROFILE PHOTO
        // =========================

        @DeleteMapping("/me/profile-photo")
        public ResponseEntity<Void> deleteProfilePhoto() {

                userService.deleteProfilePhoto();

                return ResponseEntity
                                .noContent()
                                .build();
        }

        // =========================
        // GET PROFILE PHOTO
        // =========================

        @GetMapping("/{id}/profile-photo")
        public ResponseEntity<ByteArrayResource> getProfilePhoto(
                        @PathVariable Long id) {

                byte[] photo = userService.getProfilePhoto(id);

                ByteArrayResource resource = new ByteArrayResource(photo);

                return ResponseEntity.ok()
                                .header(
                                                HttpHeaders.CONTENT_DISPOSITION,
                                                "inline")
                                .contentType(MediaType.IMAGE_JPEG)
                                .contentLength(photo.length)
                                .body(resource);
        }

        // =========================
        // CHANGE PASSWORD
        // =========================

        @PutMapping("/me/change-password")
        public ResponseEntity<Void> changePassword(
                        @Valid @RequestBody ChangePasswordRequest request) {

                userService.changePassword(request);

                return ResponseEntity
                                .noContent()
                                .build();
        }
}