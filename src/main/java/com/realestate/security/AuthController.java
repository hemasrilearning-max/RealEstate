package com.realestate.security;

import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.otp.OtpPurpose;
import com.realestate.otp.OtpRequest;
import com.realestate.otp.OtpService;
import com.realestate.otp.OtpVerificationRequest;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    // ============================================================
    // CHECK EMAIL
    // ============================================================

    @PostMapping("/check-email")
    public ResponseEntity<String> checkEmail(
            @Valid @RequestBody EmailCheckRequest request) {

        return ResponseEntity.ok(
                authService.checkEmail(request)
        );
    }

    // ============================================================
    // REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody CreateUserRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    // ============================================================
    // GENERATE OTP
    // ============================================================

    @PostMapping("/generate-otp")
    public ResponseEntity<String> generateOtp(
            @Valid @RequestBody OtpRequest request) {

        otpService.generateAndSendOtp(
                request.getEmail(),
                request.getRecipientName(),
                request.getPurpose()
        );

        return ResponseEntity.ok(
                "OTP has been sent to " + request.getEmail()
        );
    }

    // ============================================================
    // VERIFY OTP
    // ============================================================

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody OtpVerificationRequest request) {

        otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                request.getPurpose()
        );

        return ResponseEntity.ok(
                "OTP verified successfully."
        );
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request)
        );
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetPassword(request)
        );
    }

    // ============================================================
    // HEALTH CHECK
    // ============================================================

    @GetMapping("/health")
    public ResponseEntity<String> health() {

        return ResponseEntity.ok(
                "Auth service is up"
        );
    }
}