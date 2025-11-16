package com.anudeep.bankingsystem.config;

import com.anudeep.bankingsystem.security.CustomPrincipal;
import com.anudeep.bankingsystem.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");
            String token = null;

            // Extract Bearer token
            if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                token = header.substring(7);
            }

            if (token != null && jwtUtil.validateToken(token)) {

                Long userId = jwtUtil.getUserId(token);
                String email = jwtUtil.getEmail(token);
                String role = jwtUtil.getRole(token);

                CustomPrincipal principal = new CustomPrincipal(userId, email, role);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(() -> "ROLE_" + role)
                        );

                auth.setDetails(new WebAuthenticationDetailsSource()
                        .buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(auth);
            } else if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                // Bearer token present but invalid
                sendUnauthorizedError(response, "Invalid or expired token");
                return;
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("Authentication error: ", e);
            sendUnauthorizedError(response, "Authentication failed");
        }
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorMap = new HashMap<>();
        errorMap.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        errorMap.put("message", message);
        errorMap.put("error", "Unauthorized");

        response.getWriter().write(objectMapper.writeValueAsString(errorMap));
    }
}
