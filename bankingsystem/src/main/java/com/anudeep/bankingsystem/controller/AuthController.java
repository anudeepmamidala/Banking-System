package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.auth.*;
import com.anudeep.bankingsystem.dto.user.ChangePasswordRequest;
import com.anudeep.bankingsystem.dto.user.UpdateProfileRequest;
import com.anudeep.bankingsystem.service.AuthService;
import com.anudeep.bankingsystem.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Authentication", description = "User registration, login, and token refresh endpoints")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account with email and password")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or email already exists")
    })
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return access/refresh tokens")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generate new access token using refresh token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest rr) {
        return ResponseEntity.ok(authService.refresh(rr));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Retrieve authenticated user's profile information")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) auth.getCredentials();
        Long userId = jwtUtil.getUserId(token);
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update authenticated user's profile information")
    @ApiResponse(responseCode = "200", description = "Profile updated successfully")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) auth.getCredentials();
        Long userId = jwtUtil.getUserId(token);
        return ResponseEntity.ok(authService.updateProfile(userId, req));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change authenticated user's password")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) auth.getCredentials();
        Long userId = jwtUtil.getUserId(token);
        authService.changePassword(userId, req);
        return ResponseEntity.ok("Password changed successfully");
    }
}
