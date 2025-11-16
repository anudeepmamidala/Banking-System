package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.analytics.*;
import com.anudeep.bankingsystem.service.AnalyticsService;
import com.anudeep.bankingsystem.util.AuthenticationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Financial analytics and statistics - dashboard, spending trends, monthly summaries")
@SecurityRequirement(name = "bearer-jwt")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard-summary")
    @Operation(summary = "Dashboard summary", description = "Get overall financial summary including total balance, income, expenses, and transaction count")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(analyticsService.getDashboardSummary(userId));
    }

    @GetMapping("/spending-by-category")
    @Operation(summary = "Spending by category", description = "Get breakdown of spending by transaction category with counts")
    public ResponseEntity<SpendingByCategoryResponse> getSpendingByCategory(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(analyticsService.getSpendingByCategory(userId));
    }

    @GetMapping("/monthly-summary")
    @Operation(summary = "Monthly trends", description = "Get monthly income, expense, and net change trends (default: last 12 months)")
    public ResponseEntity<List<MonthlySummaryResponse>> getMonthlySummary(
            Authentication auth,
            @RequestParam(defaultValue = "12") int months
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(analyticsService.getMonthlySummary(userId, months));
    }

    @GetMapping("/account-summary")
    @Operation(summary = "Account summary", description = "Get summary of all accounts with balances and transaction counts")
    public ResponseEntity<List<AccountSummaryResponse>> getAccountSummary(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(analyticsService.getAccountSummary(userId));
    }
}
