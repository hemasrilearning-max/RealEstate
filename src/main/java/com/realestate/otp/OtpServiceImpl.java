package com.realestate.otp;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.realestate.email.EmailService;
import com.realestate.common.exception.RegistrationException;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;

    
    public void generateAndSendOtp(
            String email,
            String recipientName,
            OtpPurpose purpose) {

        SecureRandom secureRandom = new SecureRandom();

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        OtpVerification otpVerification =
                OtpVerification.builder()
                        .email(email)
                        .otp(otp)
                        .purpose(purpose)
                        .expiryTime(
                                LocalDateTime.now().plusMinutes(10)
                        )
                        .verified(false)
                        .build();

        otpVerificationRepository.save(otpVerification);

        if (purpose == OtpPurpose.REGISTRATION) {

            emailService.sendVerificationOtp(
                    email,
                    recipientName,
                    otp
            );

        } else if (purpose == OtpPurpose.PASSWORD_RESET) {

            emailService.sendPasswordResetOtp(
                    email,
                    recipientName,
                    otp
            );

        } else {

            throw new RegistrationException(
                    "Unsupported OTP purpose."
            );
        }
    }


    public boolean verifyOtp(
            String email,
            String otp,
            OtpPurpose purpose) {

        OtpVerification otpVerification =
                otpVerificationRepository
                        .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                                email,
                                purpose
                        )
                        .orElseThrow(() ->
                                new RegistrationException(
                                        "OTP not found."
                                )
                        );

        if (otpVerification.isVerified()) {
            throw new RegistrationException(
                    "OTP has already been verified."
            );
        }

        if (otpVerification.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new RegistrationException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (!otpVerification.getOtp().equals(otp)) {

            throw new RegistrationException(
                    "Invalid OTP."
            );
        }

        otpVerification.setVerified(true);
        otpVerification.setVerifiedAt(LocalDateTime.now());

        otpVerificationRepository.save(otpVerification);

        return true;
    }
}