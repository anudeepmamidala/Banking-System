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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Services", description = "AI-powered transaction categorization using machine learning")
@SecurityRequirement(name = "bearer-jwt")
public class AiController {
    private static final Logger logger = LoggerFactory.getLogger(AiController.class);

    private final AiService aiService;
    private final TransactionRepository txnRepo;

    @PostMapping("/categorize/{txId}")
    @Operation(summary = "Categorize transaction", description = "Use AI to categorize an existing transaction by ID")
    public ResponseEntity<CategorizeResponse> categorizeById(
            @PathVariable Long txId,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        logger.info("Categorizing transaction {} for user: {}", txId, userId);
        
        Transaction t = txnRepo.findById(txId)
                .orElseThrow(() -> new ApiException("Transaction not found"));

        // FIX #1: Null check for user
        if (t.getUser() == null || !t.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized categorization attempt for transaction {} by user: {}", txId, userId);
            throw new ApiException("Unauthorized: Transaction does not belong to you");
        }

        // Call AI service and get the categorization response
        CategorizeResponse response = aiService.categorizeTransaction(t);
        
        if (response == null) {
            logger.error("AI categorization returned null for transaction: {}", txId);
            throw new ApiException("Failed to categorize transaction");
        }

        logger.info("Transaction {} categorized as: {}", txId, response.getCategory());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict")
    @Operation(summary = "Predict category", description = "Predict category for a transaction without saving (for preview)")
    public ResponseEntity<CategorizeResponse> predict(
            @RequestBody CategorizeRequest req,
            Authentication auth
    ) {
        Long userId = AuthenticationUtil.extractUserId(auth);
        logger.info("Predicting category for user: {}", userId);

        // FIX #2: Validate request body
        if (req == null || req.getDescription() == null || req.getDescription().isBlank()) {
            logger.warn("Invalid categorization request from user: {}", userId);
            throw new ApiException("Description is required for categorization");
        }

        // Create temporary transaction (without ID - won't be saved)
        Transaction temp = Transaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount() != null ? 
                        BigDecimal.valueOf(req.getAmount()) : BigDecimal.ZERO)
                .build();

        // Call AI service and get the categorization response
        CategorizeResponse response = aiService.categorizeTransaction(temp);
        
        if (response == null) {
            logger.error("AI categorization returned null for prediction");
            throw new ApiException("Failed to predict category");
        }

        logger.info("Predicted category: {} with confidence: {}", response.getCategory(), response.getConfidence());
        return ResponseEntity.ok(response);
    }
}
