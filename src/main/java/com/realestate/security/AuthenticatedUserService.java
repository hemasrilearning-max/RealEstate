package com.realestate.security;

import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {

  private final UserRepository userRepository;

  public User getCurrentUser() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null ||
        !authentication.isAuthenticated()) {

      throw new RuntimeException("User is not authenticated");
    }

    String username = authentication.getName();

    return userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
  }
}
