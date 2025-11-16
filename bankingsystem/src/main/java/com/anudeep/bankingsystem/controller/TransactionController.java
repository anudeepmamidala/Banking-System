package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.PaginatedResponse;
import com.anudeep.bankingsystem.dto.transaction.*;
import com.anudeep.bankingsystem.service.TransactionService;
import com.anudeep.bankingsystem.util.AuthenticationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management - deposit, withdraw, transfer, history, filtering, and analytics")
@SecurityRequirement(name = "bearer-jwt")
public class TransactionController {

    private final TransactionService service;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds", description = "Deposit money into an account")
    public ResponseEntity<TransactionResponse> deposit(
            @Valid @RequestBody TransactionRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.deposit(userId, req));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds", description = "Withdraw money from an account")
    public ResponseEntity<TransactionResponse> withdraw(
            @Valid @RequestBody TransactionRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.withdraw(userId, req));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds", description = "Transfer money between two accounts")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransactionRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.transfer(userId, req));
    }

    @GetMapping("/history")
    @Operation(summary = "Transaction history", description = "Get all transactions for the user (non-paginated)")
    public ResponseEntity<List<TransactionResponse>> list(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.listForUser(userId));
    }

    @GetMapping("/history/paginated")
    @Operation(summary = "Paginated transaction history", description = "Get transactions with pagination support (default: page 0, size 10)")
    public ResponseEntity<PaginatedResponse<TransactionResponse>> listPaginated(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.listForUserPaginated(userId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details", description = "Get full details of a specific transaction including related accounts")
    public ResponseEntity<TransactionDetailResponse> getTransactionDetails(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.getTransactionDetails(userId, id));
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter transactions", description = "Filter transactions by date range, category, type, and amount")
    public ResponseEntity<List<TransactionResponse>> filterTransactions(
            @RequestBody TransactionFilterRequest filter,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.filterTransactions(userId, filter));
    }

    @GetMapping("/search")
    @Operation(summary = "Search transactions", description = "Search transactions by description or merchant name")
    public ResponseEntity<List<TransactionResponse>> search(
            @RequestParam String query,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.searchTransactions(userId, query));
    }

    @GetMapping("/by-category/{category}")
    @Operation(summary = "Get transactions by category", description = "Get all transactions in a specific category")
    public ResponseEntity<List<TransactionResponse>> getByCategory(
            @PathVariable String category,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.getTransactionsByCategory(userId, category));
    }

    @GetMapping("/by-type/{type}")
    @Operation(summary = "Get transactions by type", description = "Get transactions by type (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT)")
    public ResponseEntity<List<TransactionResponse>> getByType(
            @PathVariable String type,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.getTransactionsByType(userId, type));
    }

    @GetMapping("/by-date-range")
    @Operation(summary = "Get transactions by date range", description = "Get transactions between two dates (format: yyyy-MM-dd'T'HH:mm:ss)")
    public ResponseEntity<List<TransactionResponse>> getByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return ResponseEntity.ok(service.getTransactionsByDateRange(userId, start, end));
    }
}
