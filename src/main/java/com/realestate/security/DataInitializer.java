package com.realestate.security;

import com.realestate.modules.user.entity.Role;
import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.enums.RoleType;
import com.realestate.modules.user.enums.UserStatus;
import com.realestate.modules.user.repository.RoleRepository;
import com.realestate.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Create roles
        for (RoleType roleType : RoleType.values()) {

            roleRepository.findByName(roleType)
                    .orElseGet(() ->
                            roleRepository.save(
                                    Role.builder()
                                            .name(roleType)
                                            .build()
                            )
                    );
        }

        // Create Super Admin
        if (!userRepository
                .existsByUsername("admin")) {

            Role superAdminRole =
                    roleRepository
                            .findByName(RoleType.SUPER_ADMIN)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "SUPER_ADMIN role not found"
                                    )
                            );

            User superAdmin =
                    User.builder()
                            .username("admin")
                            .firstName("Super")
                            .lastName("Admin")
                            .email("admin@realestate.com")
                            .password(
                                    passwordEncoder.encode(
                                            "admin@123"
                                    )
                            )
                            .role(superAdminRole)
                            .status(UserStatus.ACTIVE)
                            .build();

            userRepository.save(superAdmin);

            System.out.println(
                    "Default Super Admin created successfully."
            );
        }
    }
}