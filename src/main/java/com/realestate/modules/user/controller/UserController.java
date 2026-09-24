package com.realestate.modules.user.controller;

import com.realestate.modules.user.dto.request.ChangeUserStatusRequest;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.dto.request.UpdateUserRequest;
import com.realestate.modules.user.dto.response.UserResponse;
import com.realestate.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // GET USER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        UserResponse response = userService.getUserById(id);

        return ResponseEntity.ok(response);
    }

    // =========================
    // GET ALL USERS
    // =========================

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers();

        return ResponseEntity.ok(users);
    }

    // =========================
    // UPDATE USER
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(response);
    }

    // =========================
    // CHANGE USER STATUS
    // =========================

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> changeUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeUserStatusRequest request) {

        UserResponse response = userService.changeUserStatus(id, request);

        return ResponseEntity.ok(response);
    }

    // =========================
    // DELETE USER
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}