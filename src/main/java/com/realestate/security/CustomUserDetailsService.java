package com.realestate.security;

import com.realestate.modules.user.entity.User;
import com.realestate.modules.user.repository.UserRepository;
import com.realestate.modules.user.enums.UserStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

    	User user = userRepository.findByUsername(username)
    	        .orElseGet(() ->
    	                userRepository.findByEmail(username)
    	                        .orElseThrow(() ->
    	                                new UsernameNotFoundException(
    	                                        "User not found with username or email: " + username
    	                                )
    	                        )
    	        );

    	boolean enabled =
    	        user.getStatus() == UserStatus.ACTIVE
    	        && user.isEmailVerified();
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                enabled,
                true,
                true,
                true,
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().getName()
                        )
                )
        );
    }
}