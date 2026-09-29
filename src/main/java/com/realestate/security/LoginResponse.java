package com.realestate.security;

import com.realestate.modules.user.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String accessToken;

    private String tokenType;

    private Long userId;

    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private RoleType role;
}