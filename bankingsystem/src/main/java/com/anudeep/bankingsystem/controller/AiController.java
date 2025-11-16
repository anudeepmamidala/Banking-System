package com.anudeep.bankingsystem.controller;

import com.anudeep.bankingsystem.dto.ai.CategorizeRequest;
import com.anudeep.bankingsystem.dto.ai.CategorizeResponse;
import com.anudeep.bankingsystem.entity.Transaction;
import com.anudeep.bankingsystem.exception.ApiException;
import com.anudeep.bankingsystem.repository.TransactionRepository;
import com.anudeep.bankingsystem.service.AiService;
import com.anudeep.bankingsystem.util.AuthenticationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Services", description = "AI-powered transaction categorization using machine learning")
@SecurityRequirement(name = "bearer-jwt")
public class AiController {

    private final AiService aiService;
    private final TransactionRepository txnRepo;

    @PostMapping("/categorize/{txId}")
    @Operation(summary = "Categorize transaction", description = "Use AI to categorize an existing transaction by ID")
    public ResponseEntity<CategorizeResponse> categorizeById(
            @PathVariable Long txId,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        
        Transaction t = txnRepo.findById(txId)
                .orElseThrow(() -> new ApiException("Transaction not found"));

        if (!t.getUser().getId().equals(userId)) {
            throw new ApiException("Unauthorized: Transaction does not belong to you");
        }

        return ResponseEntity.ok(aiService.categorizeTransaction(t));
    }

    @PostMapping("/predict")
    @Operation(summary = "Predict category", description = "Predict category for a transaction without saving (for preview)")
    public ResponseEntity<CategorizeResponse> predict(
            @RequestBody CategorizeRequest req,
            Authentication auth
    ) {
        AuthenticationUtil.extractUserId(auth);

        Transaction temp = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount() != null ? 
                        java.math.BigDecimal.valueOf(req.getAmount()) : null)
                .build();

        return ResponseEntity.ok(aiService.categorizeTransaction(temp));
    }
}
