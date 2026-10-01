package com.realestate.email;

public interface EmailService {

    void sendVerificationOtp(
            String recipientEmail,
            String recipientName,
            String otp
    );
    
    void sendPasswordResetOtp(
            String recipientEmail,
            String recipientName,
            String otp
    );
}