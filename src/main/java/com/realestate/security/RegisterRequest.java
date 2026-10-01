package com.realestate.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.*;
import com.realestate.modules.user.enums.AccountType;
import com.realestate.modules.user.enums.RoleType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotNull(message = "Role is required")
    private RoleType role;

    /*
     * Username is optional.
     *
     * If the user does not provide a username,
     * the email address will be used as the username.
     */
    @Size(max = 50, message = "Username must not exceed 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100,
          message = "Password must be between 8 and 100 characters")
    private String password;

    @Pattern(
        regexp = "^$|^[0-9+\\-() ]{7,20}$",
        message = "Invalid phone number format"
    )
    private String phone;
}