package com.anudeep.bankingsystem.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for AI chat endpoint.
 * Contains the user's message and optionally a context flag.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {
    private String message;     // user question, e.g. "How much did I spend last month?"
    private boolean includeHistory; // whether AI should fetch transaction history for context
}
