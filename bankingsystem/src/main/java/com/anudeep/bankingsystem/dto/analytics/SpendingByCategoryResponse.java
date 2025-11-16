package com.anudeep.bankingsystem.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpendingByCategoryResponse {
    private Map<String, BigDecimal> categorySpending;
    private Map<String, Integer> categoryCount;
    private BigDecimal totalSpending;
}