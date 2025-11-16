package com.anudeep.bankingsystem.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionFilterRequest {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String category;
    private String type;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String description;
}
