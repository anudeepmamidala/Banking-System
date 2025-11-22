package com.anudeep.bankingsystem.dto.transaction;

import com.anudeep.bankingsystem.dto.account.AccountResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailResponse {
    private Long id;
    private AccountResponse account; // The user's own account involved
    
    // Original recipient account details
    private AccountResponse relatedAccount; 
    
    // **NEW FIELD:** To explicitly carry the name of the recipient's user for transfers
    private String recipientUserName; 

    private BigDecimal amount;
    private String type;
    private String category;
    private Double categoryConfidence;
    private String description;
    private String merchant;
    private LocalDateTime createdAt;
}