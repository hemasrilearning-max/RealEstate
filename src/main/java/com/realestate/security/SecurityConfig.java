package com.realestate.security;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

                // =========================
                // CORS
                // =========================
                .cors(cors -> {
                })

                // =========================
                // CSRF
                // =========================
                .csrf(csrf -> csrf.disable())

                // =========================
                // SESSION
                // =========================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                // =========================
                // AUTHORIZATION
                // =========================
                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // CORS PREFLIGHT
                        // =========================
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**")
                        .permitAll()

                        // =========================
                        // AUTHENTICATION APIs
                        // =========================
                        .requestMatchers(
                                "/api/auth/**")
                        .permitAll()

                        // =========================
                        // PUBLIC USER REGISTRATION
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users")
                        .permitAll()

                        // =========================
                        // ACTUATOR
                        // =========================
                        .requestMatchers(
                                "/actuator/**")
                        .permitAll()

                        // =========================
                        // EMAIL TESTING
                        // =========================
                        .requestMatchers(
                                "/api/test-email/**")
                        .permitAll()

                        // =========================
                        // SUPER ADMIN APIs
                        // =========================
                        .requestMatchers(
                                "/api/admin/**")
                        .hasRole("SUPER_ADMIN")

                        // =========================
                        // PUBLIC PROPERTY VIEWING
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/properties/**")
                        .permitAll()

                        // =========================
                        // PUBLIC PROPERTY MEDIA VIEWING
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/media/**")
                        .permitAll()

                        // =========================
                        // PUBLIC PROPERTY IMAGE FILES
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/uploads/**")
                        .permitAll()

                        // =========================
                        // EVERYTHING ELSE
                        // REQUIRES LOGIN
                        // =========================
                        .anyRequest().authenticated())

                // =========================
                // JWT FILTER
                // =========================
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}