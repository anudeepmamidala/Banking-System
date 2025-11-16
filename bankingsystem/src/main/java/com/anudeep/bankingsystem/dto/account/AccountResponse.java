package com.anudeep.bankingsystem.dto.account;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor

@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String name;
    private String type;
    private BigDecimal balance;
}
