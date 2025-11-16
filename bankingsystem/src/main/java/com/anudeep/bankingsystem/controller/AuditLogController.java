package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.entity.AuditLog;
import com.anudeep.bankingsystem.service.AuditService;
import com.anudeep.bankingsystem.util.AuthenticationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "View audit logs of user activities")
@SecurityRequirement(name = "bearer-jwt")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get audit logs", description = "Get all audit logs for the authenticated user")
    public ResponseEntity<List<AuditLog>> getAuditLogs(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(auditService.getUserAuditLogs(userId));
    }

    @GetMapping("/by-action/{action}")
    @Operation(summary = "Get logs by action", description = "Get audit logs filtered by action type")
    public ResponseEntity<List<AuditLog>> getLogsByAction(
            @PathVariable String action,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(auditService.getUserAuditLogsByAction(userId, action));
    }

    @GetMapping("/by-date-range")
    @Operation(summary = "Get logs by date range", description = "Get audit logs within a date range")
    public ResponseEntity<List<AuditLog>> getLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return ResponseEntity.ok(auditService.getUserAuditLogsByDateRange(userId, start, end));
    }
}