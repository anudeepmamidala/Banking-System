package com.anudeep.bankingsystem.util;

import com.anudeep.bankingsystem.security.CustomPrincipal;
import org.springframework.security.core.Authentication;

public class AuthenticationUtil {

    private AuthenticationUtil() {
        // Utility class
    }

    public static Long extractUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is required");
        }
        return ((CustomPrincipal) auth.getPrincipal()).getUserId();
    }

    public static String extractEmail(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is required");
        }
        return ((CustomPrincipal) auth.getPrincipal()).getEmail();
    }

    public static String extractRole(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is required");
        }
        return ((CustomPrincipal) auth.getPrincipal()).getRole();
    }

    public static CustomPrincipal getPrincipal(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is required");
        }
        return (CustomPrincipal) auth.getPrincipal();
    }
}
