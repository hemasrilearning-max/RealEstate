package com.realestate.security;

import java.time.LocalDateTime;

import com.realestate.common.exception.RegistrationException;
import com.realestate.modules.user.dto.request.CreateUserRequest;
import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.repository.RoleRepository;
import com.realestate.modules.user.repository.UserRepository;
import com.realestate.otp.OtpPurpose;
import com.realestate.otp.OtpService;
import com.realestate.otp.OtpVerification;
import com.realestate.otp.OtpVerificationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final OtpVerificationRepository otpVerificationRepository;

    // ============================================================
    // CHECK EMAIL
    // ============================================================

    public String checkEmail(EmailCheckRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RegistrationException(
                    "Email is already registered. Please use a different email."
            );
        }

        return "Email is available.";
    }

    // ============================================================
    // LOGIN
    // ============================================================

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseGet(() ->
                        userRepository
                                .findByEmail(request.getUsername())
                                .orElseThrow(() ->
                                        new RegistrationException(
                                                "User not found."
                                        )
                                )
                );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        request.getUsername()
                );

        String token =
                jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .build();
    }

    // ============================================================
    // FINAL REGISTRATION
    // ============================================================

    public String register(CreateUserRequest request) {

        // --------------------------------------------------------
        // 1. Check whether email already exists
        // --------------------------------------------------------

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RegistrationException(
                    "Email is already registered. Please use a different email."
            );
        }

        // --------------------------------------------------------
        // 2. Find latest registration OTP
        // --------------------------------------------------------

        OtpVerification registrationOtp =
                otpVerificationRepository
                        .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                                request.getEmail(),
                                OtpPurpose.REGISTRATION
                        )
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "Registration OTP not found. Please verify your email first."
                                )
                        );

        // --------------------------------------------------------
        // 3. Check whether OTP was verified
        // --------------------------------------------------------

        if (!registrationOtp.isVerified()) {

            throw new RegistrationException(
                    "Please verify the registration OTP before completing registration."
            );
        }

        // --------------------------------------------------------
        // 4. Check OTP expiry
        // --------------------------------------------------------

        if (registrationOtp.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new RegistrationException(
                    "Registration OTP has expired. Please request a new OTP."
            );
        }

        // --------------------------------------------------------
        // 5. Determine username
        // --------------------------------------------------------

        String username = request.getUsername();

        if (username == null || username.trim().isEmpty()) {
            username = request.getEmail();
        }

        // --------------------------------------------------------
        // 6. Check username uniqueness
        // --------------------------------------------------------

        if (userRepository.existsByUsername(username)) {

            throw new RegistrationException(
                    "Username is already taken. Please choose another username."
            );
        }

        // --------------------------------------------------------
        // 7. Allow BUYER, SELLER and BROKER
        // --------------------------------------------------------

        if (request.getRole() != RoleType.BUYER
                && request.getRole() != RoleType.SELLER
                && request.getRole() != RoleType.BROKER) {

            throw new RegistrationException(
                    "Only BUYER, SELLER or BROKER registration is allowed."
            );
        }

        // --------------------------------------------------------
        // 8. Find selected role
        // --------------------------------------------------------

        Role role = roleRepository
                .findByName(request.getRole())
                .orElseThrow(() ->
                        new RegistrationException(
                                "Selected role is not available."
                        )
                );

        // --------------------------------------------------------
        // 9. Create user
        // --------------------------------------------------------

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(username)
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .accountType(request.getAccountType())
                .role(role)

                // IMPORTANT:
                // OTP was successfully verified,
                // therefore email is verified.
                .emailVerified(true)

                .build();

        // --------------------------------------------------------
        // 10. Save user
        // --------------------------------------------------------

        userRepository.save(user);

        return "Registration successful. You can now login.";
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    public String forgotPassword(
            ForgotPasswordRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException(
                                "No account found with this email."
                        )
                );

        // Generate PASSWORD_RESET OTP
        otpService.generateAndSendOtp(
                user.getEmail(),
                user.getFirstName(),
                OtpPurpose.PASSWORD_RESET
        );

        return "Password reset OTP has been sent to your email.";
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    public String resetPassword(
            ResetPasswordRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException(
                                "No account found with this email."
                        )
                );

        // --------------------------------------------------------
        // Find latest PASSWORD_RESET OTP
        // --------------------------------------------------------

        OtpVerification passwordResetOtp =
                otpVerificationRepository
                        .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                                request.getEmail(),
                                OtpPurpose.PASSWORD_RESET
                        )
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "Password reset OTP not found."
                                )
                        );

        // --------------------------------------------------------
        // OTP must be verified
        // --------------------------------------------------------

        if (!passwordResetOtp.isVerified()) {

            throw new RegistrationException(
                    "Please verify the password reset OTP first."
            );
        }

        // --------------------------------------------------------
        // OTP must not be expired
        // --------------------------------------------------------

        if (passwordResetOtp.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new RegistrationException(
                    "Password reset OTP has expired. Please request a new password."
            );
        }

        // --------------------------------------------------------
        // Update password
        // --------------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        return "Password reset successfully. You can now login with your new password.";
    }
}