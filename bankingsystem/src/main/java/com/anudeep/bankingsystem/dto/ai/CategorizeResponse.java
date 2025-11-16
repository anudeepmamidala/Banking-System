package com.anudeep.bankingsystem.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorizeResponse {
    private String category;
    private double confidence;
}
