package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.account.*;
import com.anudeep.bankingsystem.service.AccountService;
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

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management - create, read, update, delete operations")
@SecurityRequirement(name = "bearer-jwt")
public class AccountController {

    private final AccountService service;

    @PostMapping("/create")
    @Operation(summary = "Create new account", description = "Create a new bank account for the authenticated user")
    public ResponseEntity<AccountResponse> create(
            @Valid @RequestBody AccountRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(userId, req));
    }

    @GetMapping
    @Operation(summary = "List all accounts", description = "Get all accounts for the authenticated user")
    public ResponseEntity<List<AccountResponse>> list(Authentication auth) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.listForUser(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account details", description = "Get details of a specific account by ID")
    public ResponseEntity<AccountResponse> get(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.get(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account", description = "Update account name and type")
    public ResponseEntity<AccountResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        return ResponseEntity.ok(service.update(userId, id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account", description = "Delete an account (must have zero balance)")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
