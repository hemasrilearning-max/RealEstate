package com.realestate.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailCheckRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(
            max = 150,
            message = "Email must not exceed 150 characters"
    )
    private String email;
}