package com.realestate.email;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationOtp(
            String recipientEmail,
            String recipientName,
            String otp
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipientEmail);
        message.setSubject("Real Estate Application - Email Verification OTP");

        message.setText(
                "Hello " + recipientName + ",\n\n"
                + "Thank you for registering with the Real Estate Application.\n\n"
                + "Your email verification OTP is:\n\n"
                + otp + "\n\n"
                + "This OTP is valid for 10 minutes.\n\n"
                + "Please do not share this OTP with anyone.\n\n"
                + "Regards,\n"
                + "Real Estate Application"
        );

        mailSender.send(message);
    }
}