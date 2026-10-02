package com.realestate.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final String FROM_EMAIL = "realestate.application12@gmail.com";
    private static final String LOGO_CID = "homespaceLogo";
    private static final String LOGO_PATH = "static/images/homespace-logo.png";

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationOtp(
            String recipientEmail,
            String recipientName,
            String otp
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setFrom(FROM_EMAIL, "HomeSpace");
            helper.setTo(recipientEmail);
            helper.setSubject("HomeSpace - Email Verification");

            String htmlContent = buildVerificationEmailHtml(
                    recipientName,
                    otp
            );

            // true = send the content as HTML.
            helper.setText(htmlContent, true);

            /*
             * The logo is embedded inside the email using CID.
             * Therefore the email does not depend on an external image URL.
             *
             * Required project location:
             * src/main/resources/static/images/homespace-logo.png
             */
            ClassPathResource logoResource =
                    new ClassPathResource(LOGO_PATH);

            if (!logoResource.exists()) {
                throw new MailSendException(
                        "HomeSpace logo not found on classpath: " + LOGO_PATH
                );
            }

            helper.addInline(
                    LOGO_CID,
                    logoResource,
                    "image/png"
            );

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new MailSendException(
                    "Failed to create HomeSpace verification email.",
                    e
            );
        }
    }

    private String buildVerificationEmailHtml(
            String recipientName,
            String otp
    ) {
        String safeRecipientName = escapeHtml(
                recipientName == null || recipientName.isBlank()
                        ? "User"
                        : recipientName
        );

        String safeOtp = escapeHtml(otp);

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>HomeSpace Email Verification</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background-color:#f4f6f8;
                    font-family:Arial, Helvetica, sans-serif;
                ">

                    <table width="100%%"
                           cellpadding="0"
                           cellspacing="0"
                           border="0"
                           style="background-color:#f4f6f8; padding:30px 10px;">

                        <tr>
                            <td align="center">

                                <!-- Main Container -->
                                <table width="600"
                                       cellpadding="0"
                                       cellspacing="0"
                                       border="0"
                                       style="
                                           max-width:600px;
                                           width:100%%;
                                           background:#ffffff;
                                           border-radius:14px;
                                           overflow:hidden;
                                           box-shadow:0 4px 15px rgba(0,0,0,0.08);
                                       ">

                                    <!-- Header -->
                                    <tr>
                                        <td align="center"
                                            style="
                                                padding:25px 20px 15px;
                                                background:#ffffff;
                                            ">

                                            <img src="cid:%s"
                                                 alt="HomeSpace"
                                                 width="150"
                                                 style="
                                                     display:block;
                                                     width:150px;
                                                     max-width:150px;
                                                     height:auto;
                                                     border:0;
                                                 ">
                                        </td>
                                    </tr>

                                    <!-- Purple/Green Top Border -->
                                    <tr>
                                        <td style="
                                            height:5px;
                                            background:linear-gradient(
                                                90deg,
                                                #6F01B9,
                                                #42A62A
                                            );
                                        "></td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style="padding:35px 40px 30px;">

                                            <h2 style="
                                                margin:0 0 15px;
                                                color:#222222;
                                                font-size:24px;
                                                font-weight:600;
                                            ">
                                                Hello %s,
                                            </h2>

                                            <p style="
                                                margin:0 0 15px;
                                                color:#555555;
                                                font-size:15px;
                                                line-height:1.7;
                                            ">
                                                Thank you for registering with
                                                <strong style="color:#6F01B9;">
                                                    HomeSpace
                                                </strong>.
                                            </p>

                                            <p style="
                                                margin:0 0 25px;
                                                color:#555555;
                                                font-size:15px;
                                                line-height:1.7;
                                            ">
                                                Your email verification OTP has been
                                                generated successfully.
                                                Use the OTP below to verify your account.
                                            </p>

                                            <!-- OTP Box -->
                                            <table width="100%%"
                                                   cellpadding="0"
                                                   cellspacing="0"
                                                   border="0">

                                                <tr>
                                                    <td align="center"
                                                        style="
                                                            background:#f7f1fb;
                                                            border:1px solid #e3ccef;
                                                            border-radius:12px;
                                                            padding:25px 15px;
                                                        ">

                                                        <p style="
                                                            margin:0 0 8px;
                                                            color:#666666;
                                                            font-size:13px;
                                                            text-transform:uppercase;
                                                            letter-spacing:1px;
                                                            font-weight:600;
                                                        ">
                                                            Email Verification OTP
                                                        </p>

                                                        <div style="
                                                            color:#6F01B9;
                                                            font-size:34px;
                                                            font-weight:bold;
                                                            letter-spacing:8px;
                                                            margin:5px 0;
                                                        ">
                                                            %s
                                                        </div>

                                                        <p style="
                                                            margin:8px 0 0;
                                                            color:#777777;
                                                            font-size:13px;
                                                        ">
                                                            Valid for 10 minutes
                                                        </p>

                                                    </td>
                                                </tr>

                                            </table>

                                            <!-- Verification Message -->
                                            <p style="
                                                margin:25px 0 10px;
                                                color:#444444;
                                                font-size:14px;
                                                line-height:1.7;
                                            ">
                                                Please enter this OTP in the
                                                <strong>HomeSpace registration page</strong>
                                                to verify your email address and
                                                complete your account registration.
                                            </p>

                                            <!-- Security Notice -->
                                            <table width="100%%"
                                                   cellpadding="0"
                                                   cellspacing="0"
                                                   border="0"
                                                   style="margin-top:20px;">

                                                <tr>
                                                    <td style="
                                                        background:#fff8e8;
                                                        border-left:4px solid #f0a500;
                                                        padding:12px 15px;
                                                        color:#665500;
                                                        font-size:13px;
                                                        line-height:1.6;
                                                    ">
                                                        <strong>Security Notice:</strong><br>
                                                        Please do not share this OTP with
                                                        anyone. HomeSpace will never ask
                                                        you to share your verification OTP.
                                                    </td>
                                                </tr>

                                            </table>

                                            <p style="
                                                margin:25px 0 0;
                                                color:#777777;
                                                font-size:13px;
                                                line-height:1.6;
                                            ">
                                                If you did not create an account with
                                                HomeSpace, you can safely ignore this email.
                                            </p>

                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td align="center"
                                            style="
                                                background:#f8f8f8;
                                                padding:20px;
                                                border-top:1px solid #eeeeee;
                                            ">

                                            <p style="
                                                margin:0 0 6px;
                                                color:#6F01B9;
                                                font-size:15px;
                                                font-weight:bold;
                                            ">
                                                HomeSpace
                                            </p>

                                            <p style="
                                                margin:0;
                                                color:#888888;
                                                font-size:12px;
                                            ">
                                                Find &nbsp; | &nbsp;
                                                Sell &nbsp; | &nbsp;
                                                Buy &nbsp; | &nbsp;
                                                Rent
                                            </p>

                                            <p style="
                                                margin:10px 0 0;
                                                color:#aaaaaa;
                                                font-size:11px;
                                            ">
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
                """.formatted(
                LOGO_CID,
                safeRecipientName,
                safeOtp
        );
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    @Override
    public void sendPasswordResetOtp(
            String recipientEmail,
            String recipientName,
            String otp
    ) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(FROM_EMAIL);
        message.setTo(recipientEmail);
        message.setSubject("Real Estate Application - Password Reset OTP");

        message.setText(
                "Hello " + recipientName + ",\n\n"
                        + "We received a request to reset your password.\n\n"
                        + "Your password reset OTP is:\n\n"
                        + otp + "\n\n"
                        + "This OTP is valid for 10 minutes.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email.\n\n"
                        + "Please do not share this OTP with anyone.\n\n"
                        + "Regards,\n"
                        + "HomeSpace"
        );

        mailSender.send(message);
    }
}


   @Override
// public void sendVerificationOtp(String recipientEmail, String recipientName, String otp) {
//     try {
//         MimeMessage message = mailSender.createMimeMessage();
//         MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

//         helper.setFrom("realestate.application12@gmail.com");
//         helper.setTo(recipientEmail);
//         helper.setSubject("HomeSpace - Email Verification OTP");

//         // ↓↓↓ CHANGE THIS URL to your actual public logo link ↓↓↓
//         String logoUrl = "http://localhost:5173/images/hspacelogo.png";

//         String htmlContent = String.format("""
//                 <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <meta charset="UTF-8">
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                     <title>HomeSpace Email Verification</title>
//                 </head>
//                 <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
//                     <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:30px 10px;">
//                         <tr>
//                             <td align="center">
//                                 <table width="600" cellpadding="0" cellspacing="0" border="0"
//                                        style="max-width:600px;width:100%%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                                    
//                                     <!-- Header / Logo -->
//                                     <tr>
//                                         <td align="center" style="padding:25px 20px 15px;background:#ffffff;">
//                                             <img src="%s"
//                                                  alt="HomeSpace"
//                                                  width="150"
//                                                  style="display:block;width:150px;max-width:150px;height:auto;border:0;">
//                                         </td>
//                                     </tr>

//                                     <!-- Purple/Green Top Border -->
//                                     <tr>
//                                         <td style="height:5px;background:linear-gradient(90deg,#6F01B9,#42A62A);"></td>
//                                     </tr>

//                                     <!-- Content -->
//                                     <tr>
//                                         <td style="padding:35px 40px 30px;">
//                                             <h2 style="margin:0 0 15px;color:#222222;font-size:24px;font-weight:600;">
//                                                 Hello %s,
//                                             </h2>

//                                             <p style="margin:0 0 15px;color:#555555;font-size:15px;line-height:1.7;">
//                                                 Thank you for registering with
//                                                 <strong style="color:#6F01B9;">HomeSpace</strong>.
//                                             </p>

//                                             <p style="margin:0 0 25px;color:#555555;font-size:15px;line-height:1.7;">
//                                                 Your email verification OTP has been generated successfully.
//                                                 Use the OTP below to verify your account.
//                                             </p>

//                                             <!-- OTP Box -->
//                                             <table width="100%%" cellpadding="0" cellspacing="0" border="0">
//                                                 <tr>
//                                                     <td align="center"
//                                                         style="background:#f7f1fb;border:1px solid #e3ccef;border-radius:12px;padding:25px 15px;">
//                                                         <p style="margin:0 0 8px;color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
//                                                             Email Verification OTP
//                                                         </p>
//                                                         <div style="color:#6F01B9;font-size:34px;font-weight:bold;letter-spacing:8px;margin:5px 0;">
//                                                             %s
//                                                         </div>
//                                                         <p style="margin:8px 0 0;color:#777777;font-size:13px;">
//                                                             Valid for 10 minutes
//                                                         </p>
//                                                     </td>
//                                                 </tr>
//                                             </table>

//                                             <p style="margin:25px 0 10px;color:#444444;font-size:14px;line-height:1.7;">
//                                                 Please enter this OTP in the
//                                                 <strong>HomeSpace registration page</strong>
//                                                 to verify your email address and complete your account registration.
//                                             </p>

//                                             <!-- Security Notice -->
//                                             <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
//                                                 <tr>
//                                                     <td style="background:#fff8e8;border-left:4px solid #f0a500;padding:12px 15px;color:#665500;font-size:13px;line-height:1.6;">
//                                                         <strong>Security Notice:</strong><br>
//                                                         Please do not share this OTP with anyone. HomeSpace will never ask you to share your verification OTP.
//                                                     </td>
//                                                 </tr>
//                                             </table>

//                                             <p style="margin:25px 0 0;color:#777777;font-size:13px;line-height:1.6;">
//                                                 If you did not create an account with HomeSpace, you can safely ignore this email.
//                                             </p>
//                                         </td>
//                                     </tr>

//                                     <!-- Footer -->
//                                     <tr>
//                                         <td align="center" style="background:#f8f8f8;padding:20px;border-top:1px solid #eeeeee;">
//                                             <p style="margin:0 0 6px;color:#6F01B9;font-size:15px;font-weight:bold;">
//                                                 HomeSpace
//                                             </p>
//                                             <p style="margin:0;color:#888888;font-size:12px;">
//                                                 Find &nbsp; | &nbsp; Sell &nbsp; | &nbsp; Buy &nbsp; | &nbsp; Rent
//                                             </p>
//                                             <p style="margin:10px 0 0;color:#aaaaaa;font-size:11px;">
//                                                 © HomeSpace. All rights reserved.
//                                             </p>
//                                         </td>
//                                     </tr>
//                                 </table>
//                             </td>
//                         </tr>
//                     </table>
//                 </body>
//                 </html>
//                 """, logoUrl, recipientName, otp);

//         helper.setText(htmlContent, true);
//         // No addInline needed anymore

//         mailSender.send(message);
//         catch (MessagingException e) {
//             throw new RuntimeException("Failed to send verification OTP email", e);
//         }
//     }

//     // } catch (MessagingException | UnsupportedEncodingException e) {
//     //     throw new RuntimeException("Failed to send verification OTP email", e);
//     // }
// }

  @Override
    public void sendVerificationOtpPast(
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
                                        
                                        <!-- Header / Logo -->
                                        <tr>
                                            <td align="center" style="padding:25px 20px 15px;background:#ffffff;">
                                                <img src="cid:homespaceLogo"
                                                     alt="HomeSpace"
                                                     width="150"
                                                     style="display:block;width:150px;max-width:150px;height:auto;border:0;">
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

            helper.setText(htmlContent, true); // true = HTML

            // Embed the logo as an inline CID image
            // Place the logo file at: src/main/resources/static/images/hspacelogo.png
            // (or adjust the path below to match your project structure)
            // helper.addInline("homespaceLogo",
            //         new ClassPathResource("hspacelogo.png"));

            ClassPathResource logoResource = new ClassPathResource("images/hspacelogo.png");
        
            if (!logoResource.exists()) {
                throw new RuntimeException("Logo file not found at: static/images/hspacelogo.png");
            }
            
            helper.addInline("homespaceLogo", logoResource, "image/png");

            mailSender.send(message);
        // } catch (MessagingException | UnsupportedEncodingException e) {
        //     throw new RuntimeException("Failed to send verification OTP email", e);
        // }

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification OTP email", e);
        }
    }
