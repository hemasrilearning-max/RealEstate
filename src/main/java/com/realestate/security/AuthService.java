package com.realestate.security;

import com.realestate.modules.user.entity.User;
import com.realestate.common.exception.RegistrationException;
import com.realestate.email.EmailService;
import com.realestate.email.EmailVerificationOtp;
import com.realestate.email.EmailVerificationOtpRepository;
import com.realestate.email.PasswordResetOtp;
import com.realestate.email.PasswordResetOtpRepository;
import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.enums.RoleType;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.SecureRandom;
import java.time.LocalDateTime;

import com.realestate.modules.user.repository.RoleRepository;
import com.realestate.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final EmailVerificationOtpRepository emailVerificationOtpRepository;
    private final PasswordEncoder passwordEncoder;
    
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
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
    
    public String register(RegisterRequest request) {

        // 1. Check whether email is already registered
    	if (userRepository.existsByEmail(request.getEmail())) {
    	    throw new RegistrationException(
    	            "Email is already registered. Please try another email."
    	    );
    	}

        // 2. Determine username
        String username = request.getUsername();

        if (username == null || username.trim().isEmpty()) {
            username = request.getEmail();
        }

        // 3. Check whether username is already taken
        if (userRepository.existsByUsername(username)) {
            throw new RegistrationException(
                    "Username is already taken. Please choose another username."
            );
        }

        // 4. Allow only BUYER or SELLER registration
        if (request.getRole() != RoleType.BUYER
                && request.getRole() != RoleType.SELLER) {

            throw new RegistrationException(
                    "Only BUYER or SELLER registration is allowed."
            );
        }

        // 5. Find the selected role
        Role role = roleRepository
                .findByName(request.getRole())
                .orElseThrow(() ->
                        new RegistrationException(
                                "Selected role is not available."
                        )
                );
        
        
        // 6. Create user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .accountType(request.getAccountType())
                .role(role)
                .emailVerified(false)
                .build();

        // 7. Save user
        User savedUser = userRepository.save(user);

        // 8. Generate 6-digit OTP
        SecureRandom secureRandom = new SecureRandom();

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        // 9. Create OTP record
        EmailVerificationOtp verificationOtp =
                EmailVerificationOtp.builder()
                        .user(savedUser)
                        .otp(otp)
                        .expiresAt(LocalDateTime.now().plusMinutes(10))
                        .verified(false)
                        .build();

        emailVerificationOtpRepository.save(verificationOtp);

        // 10. Send verification email
        emailService.sendVerificationOtp(
                savedUser.getEmail(),
                savedUser.getFirstName(),
                otp
        );

        return "Registration successful. Please check your email for the verification OTP.";
    }
    
    public String verifyEmail(VerifyEmailRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException("User not found with this email.")
                );

        EmailVerificationOtp verificationOtp =
                emailVerificationOtpRepository
                        .findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "Verification OTP not found."
                                )
                        );

        if (verificationOtp.isVerified()) {
            throw new RegistrationException(
                    "Email is already verified."
            );
        }

        if (verificationOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RegistrationException(
                    "Verification OTP has expired. Please request a new OTP."
            );
        }

        if (!verificationOtp.getOtp().equals(request.getOtp())) {
            throw new RegistrationException(
                    "Invalid verification OTP."
            );
        }

        verificationOtp.setVerified(true);
        emailVerificationOtpRepository.save(verificationOtp);

        user.setEmailVerified(true);
        userRepository.save(user);

        return "Email verified successfully. You can now login.";
    }
    
    public String forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException(
                                "No account found with this email."
                        )
                );

        SecureRandom secureRandom = new SecureRandom();

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        PasswordResetOtp passwordResetOtp =
                PasswordResetOtp.builder()
                        .user(user)
                        .otp(otp)
                        .expiresAt(LocalDateTime.now().plusMinutes(10))
                        .verified(false)
                        .build();

        passwordResetOtpRepository.save(passwordResetOtp);

        emailService.sendPasswordResetOtp(
                user.getEmail(),
                user.getFirstName(),
                otp
        );

        return "Password reset OTP has been sent to your email.";
    }
    
    public String verifyPasswordResetOtp(
            VerifyPasswordResetOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException(
                                "No account found with this email."
                        )
                );

        PasswordResetOtp passwordResetOtp =
                passwordResetOtpRepository
                        .findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "Password reset OTP not found."
                                )
                        );

        if (passwordResetOtp.isVerified()) {
            throw new RegistrationException(
                    "Password reset OTP has already been verified."
            );
        }

        if (passwordResetOtp.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RegistrationException(
                    "Password reset OTP has expired. Please request a new OTP."
            );
        }

        if (!passwordResetOtp.getOtp()
                .equals(request.getOtp())) {

            throw new RegistrationException(
                    "Invalid password reset OTP."
            );
        }

        passwordResetOtp.setVerified(true);

        passwordResetOtpRepository.save(passwordResetOtp);

        return "Password reset OTP verified successfully.";
    }
    
    public String resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RegistrationException(
                                "No account found with this email."
                        )
                );

        PasswordResetOtp passwordResetOtp =
                passwordResetOtpRepository
                        .findTopByUserOrderByCreatedAtDesc(user)
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "Password reset OTP not found."
                                )
                        );

        if (!passwordResetOtp.isVerified()) {
            throw new RegistrationException(
                    "Please verify the password reset OTP first."
            );
        }

        if (passwordResetOtp.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RegistrationException(
                    "Password reset OTP has expired. Please request a new OTP."
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        return "Password reset successfully. You can now login with your new password.";
    }
}