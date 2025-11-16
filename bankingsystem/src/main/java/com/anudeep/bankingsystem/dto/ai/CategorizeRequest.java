package com.anudeep.bankingsystem.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorizeRequest {
    private Long transactionId;
    private String description;
    private String merchant;
    private Double amount;
}
