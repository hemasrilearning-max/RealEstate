package com.realestate.email;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-email")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @PostMapping
    public String sendTestEmail(
            @RequestParam String email) {

        String testOtp = "123456";

        emailService.sendVerificationOtp(
                email,
                "Test User",
                testOtp
        );

        return "Test email sent successfully to " + email;
    }
}