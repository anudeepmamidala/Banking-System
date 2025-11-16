package com.anudeep.bankingsystem.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private Long accountId;
    private BigDecimal amount;
    private String type;
    private String description;
    private LocalDateTime createdAt;
}
