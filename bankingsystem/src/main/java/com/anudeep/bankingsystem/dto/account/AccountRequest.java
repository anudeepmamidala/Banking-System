package com.anudeep.bankingsystem.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {
    @NotBlank(message = "Account name is required")
    @Size(min = 1, max = 50, message = "Account name must be between 1 and 50 characters")
    private String name;

    @NotBlank(message = "Account type is required")
    private String type;
}