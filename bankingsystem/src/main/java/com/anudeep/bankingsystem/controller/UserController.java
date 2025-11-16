package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.user.*;
import com.anudeep.bankingsystem.service.AuthService;
import com.anudeep.bankingsystem.util.AuthenticationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile management - view, update, change password")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final AuthService authService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get current user's profile information")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile", description = "Update user's full name and other profile information")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(authService.updateProfile(userId, req));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user's password with old password verification")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        authService.changePassword(userId, req);
        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/account")
    @Operation(summary = "Delete account", description = "Permanently delete user account and all associated data")
    public ResponseEntity<Void> deleteAccount(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        authService.deleteAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
