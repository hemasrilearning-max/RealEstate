package com.realestate.otp;

public interface OtpService {

    void generateAndSendOtp(
            String email,
            String recipientName,
            OtpPurpose purpose
    );

    boolean verifyOtp(
            String email,
            String otp,
            OtpPurpose purpose
    );
}