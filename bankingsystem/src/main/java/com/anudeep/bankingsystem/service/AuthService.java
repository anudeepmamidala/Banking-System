package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.dto.auth.*;
import com.anudeep.bankingsystem.dto.user.*;
import com.anudeep.bankingsystem.entity.AppUser;
import com.anudeep.bankingsystem.entity.Role;
import com.anudeep.bankingsystem.exception.ApiException;
import com.anudeep.bankingsystem.repository.UserRepository;
import com.anudeep.bankingsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public void register(RegisterRequest req) {
        logger.info("Registering new user with email: {}", req.getEmail());
        
        String email = req.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            logger.warn("Registration failed: Email already registered - {}", email);
            throw new IllegalStateException("Email already registered");
        }

        AppUser user = AppUser.builder()
                .email(email)
                .fullName(req.getFullName())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        logger.info("User registered successfully with email: {}", email);
    }

    public AuthResponse login(LoginRequest req) {
        logger.info("Login attempt for email: {}", req.getEmail());
        
        String email = req.getEmail().toLowerCase().trim();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Login failed: User not found - {}", email);
                    return new IllegalStateException("Invalid credentials");
                });

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            logger.warn("Login failed: Invalid password for user - {}", email);
            throw new IllegalStateException("Invalid credentials");
        }

        String access = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().getValue());
        String refresh = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().getValue());

        logger.info("User logged in successfully: {}", email);

        return new AuthResponse(access, refresh);
    }

    public AuthResponse refresh(RefreshRequest rr) {
        logger.info("Refreshing token");
        
        String token = rr.getRefreshToken();

        if (!jwtUtil.validateToken(token)) {
            logger.warn("Token refresh failed: Invalid refresh token");
            throw new IllegalStateException("Invalid refresh token");
        }

        Long userId = jwtUtil.getUserId(token);
        String email = jwtUtil.getEmail(token);
        String role = jwtUtil.getRole(token);

        logger.info("Token refreshed successfully for user: {}", email);

        return new AuthResponse(
                jwtUtil.generateAccessToken(userId, email, role),
                jwtUtil.generateRefreshToken(userId, email, role)
        );
    }

    // NEW: Profile methods
    public UserProfileResponse getProfile(Long userId) {
        logger.info("Fetching profile for user: {}", userId);
        
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getValue(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        logger.info("Updating profile for user: {}", userId);
        
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        user.setFullName(req.getFullName());
        userRepository.save(user);
        
        logger.info("Profile updated successfully for user: {}", userId);

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getValue(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        logger.info("Changing password for user: {}", userId);
        
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            logger.warn("Password change failed: Invalid old password for user: {}", userId);
            throw new ApiException("Old password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        
        logger.info("Password changed successfully for user: {}", userId);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        logger.warn("Deleting account for user: {}", userId);
        
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        userRepository.delete(user);
        logger.info("Account deleted successfully for user: {}", userId);
    }
}