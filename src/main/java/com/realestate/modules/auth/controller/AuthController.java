package com.realestate.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // POST /api/auth/register
    // POST /api/auth/login
    // POST /api/auth/logout
    // POST /api/auth/refresh
    // POST /api/auth/verify-email
    // POST /api/auth/forgot-password
    // POST /api/auth/reset-password
    // POST /api/auth/2fa/send
    // POST /api/auth/2fa/verify
    // GET  /api/auth/me

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is up");
    }
}
