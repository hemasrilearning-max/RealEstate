package com.realestate.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("realestate.application12@gmail.com");
            helper.setTo(recipientEmail);
            helper.setSubject("HomeSpace - Email Verification OTP");

            String htmlContent = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>HomeSpace Email Verification</title>
                    </head>
                    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
                        <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:30px 10px;">
                            <tr>
                                <td align="center">
                                    <!-- Main Container -->
                                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                                        style="max-width:600px;width:100%%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                                        
                                    <!-- ========== LOGO (Clean & Strong) ========== -->
                                        <tr>
                                            <td align="center" style="padding:28px 20px 18px; background:#ffffff;">
                                                
                                                <!-- Main Logo Text -->
                                                <div style="
                                                    font-size:34px;
                                                    font-weight:800;
                                                    letter-spacing:-1.5px;
                                                    line-height:1;
                                                    margin-bottom:8px;
                                                    font-family:Arial, Helvetica, sans-serif;
                                                ">
                                                    <span style="color:#1a56db;">Home</span><span style="color:#42A62A;">Space</span>
                                                </div>

                                                <!-- Gradient Bar -->
                                                <div style="
                                                    width:90px;
                                                    height:5px;
                                                    background:linear-gradient(90deg, #6F01B9, #42A62A);
                                                    border-radius:3px;
                                                    margin:0 auto 10px auto;
                                                "></div>

                                                <!-- Tagline -->
                                                <div style="
                                                    font-size:12px;
                                                    color:#666666;
                                                    letter-spacing:2px;
                                                    text-transform:uppercase;
                                                    font-weight:600;
                                                ">
                                                    Find &nbsp;•&nbsp; Sell &nbsp;•&nbsp; Buy &nbsp;•&nbsp; Rent
                                                </div>
                                                
                                            </td>
                                        </tr>
                                        


                                        <!-- Purple/Green Top Border -->
                                        <tr>
                                            <td style="height:5px;background:linear-gradient(90deg,#6F01B9,#42A62A);"></td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding:35px 40px 30px;">
                                                <h2 style="margin:0 0 15px;color:#222222;font-size:24px;font-weight:600;">
                                                    Hello %s,
                                                </h2>

                                                <p style="margin:0 0 15px;color:#555555;font-size:15px;line-height:1.7;">
                                                    Thank you for registering with
                                                    <strong style="color:#6F01B9;">HomeSpace</strong>.
                                                </p>

                                                <p style="margin:0 0 25px;color:#555555;font-size:15px;line-height:1.7;">
                                                    Your email verification OTP has been generated successfully.
                                                    Use the OTP below to verify your account.
                                                </p>

                                                <!-- OTP Box -->
                                                <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td align="center"
                                                            style="background:#f7f1fb;border:1px solid #e3ccef;border-radius:12px;padding:25px 15px;">
                                                            <p style="margin:0 0 8px;color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                                                                Email Verification OTP
                                                            </p>
                                                            <div style="color:#6F01B9;font-size:34px;font-weight:bold;letter-spacing:8px;margin:5px 0;">
                                                                %s
                                                            </div>
                                                            <p style="margin:8px 0 0;color:#777777;font-size:13px;">
                                                                Valid for 10 minutes
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Verification Message -->
                                                <p style="margin:25px 0 10px;color:#444444;font-size:14px;line-height:1.7;">
                                                    Please enter this OTP in the
                                                    <strong>HomeSpace registration page</strong>
                                                    to verify your email address and complete your account registration.
                                                </p>

                                                <!-- Security Notice -->
                                                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                                                    <tr>
                                                        <td style="background:#fff8e8;border-left:4px solid #f0a500;padding:12px 15px;color:#665500;font-size:13px;line-height:1.6;">
                                                            <strong>Security Notice:</strong><br>
                                                            Please do not share this OTP with anyone. HomeSpace will never ask you to share your verification OTP.
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style="margin:25px 0 0;color:#777777;font-size:13px;line-height:1.6;">
                                                    If you did not create an account with HomeSpace, you can safely ignore this email.
                                                </p>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td align="center" style="background:#f8f8f8;padding:20px;border-top:1px solid #eeeeee;">
                                                <p style="margin:0 0 6px;color:#6F01B9;font-size:15px;font-weight:bold;">
                                                    HomeSpace
                                                </p>
                                                <p style="margin:0;color:#888888;font-size:12px;">
                                                    Find &nbsp; | &nbsp; Sell &nbsp; | &nbsp; Buy &nbsp; | &nbsp; Rent
                                                </p>
                                                <p style="margin:10px 0 0;color:#aaaaaa;font-size:11px;">
                                                    © HomeSpace. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """, recipientName, otp);

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification OTP email", e);
        }
    }

    @Override
    public void sendPasswordResetOtp(
            String recipientEmail,
            String recipientName,
            String otp
    ) 
    {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("realestate.application12@gmail.com");
            helper.setTo(recipientEmail);
            helper.setSubject("HomeSpace - Password Reset OTP");

            String htmlContent = String.format("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>HomeSpace Password Reset</title>
                    </head>
                    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
                        <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:30px 10px;">
                            <tr>
                                <td align="center">
                                    <!-- Main Container -->
                                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                                        style="max-width:600px;width:100%%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                                        
                                    <!-- ========== LOGO (Clean & Strong) ========== -->
                                        <tr>
                                            <td align="center" style="padding:28px 20px 18px; background:#ffffff;">
                                                
                                                <!-- Main Logo Text -->
                                                <div style="
                                                    font-size:34px;
                                                    font-weight:800;
                                                    letter-spacing:-1.5px;
                                                    line-height:1;
                                                    margin-bottom:8px;
                                                    font-family:Arial, Helvetica, sans-serif;
                                                ">
                                                    <span style="color:#1a56db;">Home</span><span style="color:#42A62A;">Space</span>
                                                </div>

                                                <!-- Gradient Bar -->
                                                <div style="
                                                    width:90px;
                                                    height:5px;
                                                    background:linear-gradient(90deg, #6F01B9, #42A62A);
                                                    border-radius:3px;
                                                    margin:0 auto 10px auto;
                                                "></div>

                                                <!-- Tagline -->
                                                <div style="
                                                    font-size:12px;
                                                    color:#666666;
                                                    letter-spacing:2px;
                                                    text-transform:uppercase;
                                                    font-weight:600;
                                                ">
                                                    Find &nbsp;•&nbsp; Sell &nbsp;•&nbsp; Buy &nbsp;•&nbsp; Rent
                                                </div>
                                                
                                            </td>
                                        </tr>
                                        


                                        <!-- Purple/Green Top Border -->
                                        <tr>
                                            <td style="height:5px;background:linear-gradient(90deg,#6F01B9,#42A62A);"></td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding:35px 40px 30px;">
                                                <h2 style="margin:0 0 15px;color:#222222;font-size:24px;font-weight:600;">
                                                    Hello %s,
                                                </h2>

                                                <p style="margin:0 0 15px;color:#555555;font-size:15px;line-height:1.7;">
                                                    We received a request to reset the password for your
                                                    <strong style="color:#6F01B9;">HomeSpace</strong> account.
                                                </p>

                                                <p style="margin:0 0 25px;color:#555555;font-size:15px;line-height:1.7;">
                                                    Your password reset OTP has been generated successfully.
                                                    Use the OTP below to reset your password.
                                                </p>

                                                <!-- OTP Box -->
                                                <table width="100%%" cellpadding="0" cellspacing="0" border="0">
                                                    <tr>
                                                        <td align="center"
                                                            style="background:#f7f1fb;border:1px solid #e3ccef;border-radius:12px;padding:25px 15px;">
                                                            <p style="margin:0 0 8px;color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                                                                Password Reset OTP
                                                            </p>
                                                            <div style="color:#6F01B9;font-size:34px;font-weight:bold;letter-spacing:8px;margin:5px 0;">
                                                                %s
                                                            </div>
                                                            <p style="margin:8px 0 0;color:#777777;font-size:13px;">
                                                                Valid for 10 minutes
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Reset Message -->
                                                <p style="margin:25px 0 10px;color:#444444;font-size:14px;line-height:1.7;">
                                                    Please enter this OTP in the
                                                    <strong>HomeSpace password reset page</strong>
                                                    to set a new password for your account.
                                                </p>

                                                <!-- Security Notice -->
                                                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                                                    <tr>
                                                        <td style="background:#fff8e8;border-left:4px solid #f0a500;padding:12px 15px;color:#665500;font-size:13px;line-height:1.6;">
                                                            <strong>Security Notice:</strong><br>
                                                            Please do not share this OTP with anyone. HomeSpace will never ask you to share your password reset OTP.
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style="margin:25px 0 0;color:#777777;font-size:13px;line-height:1.6;">
                                                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                                </p>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td align="center" style="background:#f8f8f8;padding:20px;border-top:1px solid #eeeeee;">
                                                <p style="margin:0 0 6px;color:#6F01B9;font-size:15px;font-weight:bold;">
                                                    HomeSpace
                                                </p>
                                                <p style="margin:0;color:#888888;font-size:12px;">
                                                    Find &nbsp; | &nbsp; Sell &nbsp; | &nbsp; Buy &nbsp; | &nbsp; Rent
                                                </p>
                                                <p style="margin:10px 0 0;color:#aaaaaa;font-size:11px;">
                                                    © HomeSpace. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """, recipientName, otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset OTP email", e);
        }
    }
   
}