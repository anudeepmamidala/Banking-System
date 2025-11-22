package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.dto.ai.CategorizeResponse;
import com.anudeep.bankingsystem.entity.Transaction;
import com.anudeep.bankingsystem.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiService {
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final TransactionRepository txnRepo;
    private final RestTemplate restTemplate;

    @Value("${ai.api.url:}")
    private String aiApiUrl;

    @Value("${ai.api.key:}")
    private String aiApiKey;

    private static final Map<Pattern, String> KEYWORDS = Map.ofEntries(
            Map.entry(Pattern.compile("starbucks|coffee|cafe", Pattern.CASE_INSENSITIVE), "RESTAURANT"),
            Map.entry(Pattern.compile("uber|ola|taxi|cab", Pattern.CASE_INSENSITIVE), "TRANSPORT"),
            Map.entry(Pattern.compile("netflix|spotify|prime", Pattern.CASE_INSENSITIVE), "ENTERTAINMENT"),
            Map.entry(Pattern.compile("grocery|walmart|costco|target|amazon", Pattern.CASE_INSENSITIVE), "SHOPPING"),
            Map.entry(Pattern.compile("burger|pizza|food|restaurant|diner", Pattern.CASE_INSENSITIVE), "FOOD"),
            Map.entry(Pattern.compile("gym|fitness|yoga|sports", Pattern.CASE_INSENSITIVE), "HEALTH"),
            Map.entry(Pattern.compile("hospital|doctor|pharmacy|medicine", Pattern.CASE_INSENSITIVE), "MEDICAL"),
            Map.entry(Pattern.compile("gas|fuel|petrol|diesel", Pattern.CASE_INSENSITIVE), "FUEL")
    );

    @Transactional
public CategorizeResponse categorizeTransaction(Transaction t) {
    if (t == null) {
        logger.warn("Attempted to categorize null transaction");
        return new CategorizeResponse("UNCATEGORIZED", 0.0);
    }

    try {
        logger.info("Categorizing transaction id: {}", t.getId());
        
        // Try external LLM model first
        CategorizeResponse resp = tryExternalModel(t);

        // Fallback to rule-based
        if (resp == null) {
            logger.debug("External model failed, using rule-based categorization");
            resp = ruleBased(
                    t.getDescription(),
                    t.getAmount() != null ? t.getAmount().doubleValue() : null
            );
        }

        // Only save if transaction has been persisted (has ID)
        if (t.getId() != null && resp != null) {
            t.setCategory(resp.getCategory());
            t.setCategoryConfidence(resp.getConfidence());
            txnRepo.save(t);
            logger.info("Transaction {} categorized as: {} (confidence: {})", 
                    t.getId(), resp.getCategory(), resp.getConfidence());
        } else if (t.getId() == null) {
            logger.debug("Transaction not persisted yet, skipping categorization save");
            // For unpersisted transactions (like in /api/ai/predict), just return the response
        }

        return resp != null ? resp : new CategorizeResponse("UNCATEGORIZED", 0.0);

    } catch (Exception e) {
        // Catch ALL exceptions to prevent propagation
        logger.error("Error categorizing transaction {}: {}", t.getId(), e.getMessage(), e);
        // Return default response instead of throwing
        return new CategorizeResponse("UNCATEGORIZED", 0.0);
    }
}

    private CategorizeResponse tryExternalModel(Transaction t) {
        if (aiApiUrl == null || aiApiUrl.isBlank()) {
            logger.debug("AI API URL not configured, skipping external model");
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            if (aiApiKey != null && !aiApiKey.isBlank()) {
                headers.set("Authorization", "Bearer " + aiApiKey);
            }

            Map<String, Object> payload = Map.of(
                    "description", t.getDescription() != null ? t.getDescription() : "",
                    "amount", t.getAmount() != null ? t.getAmount().doubleValue() : 0
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> res = restTemplate.postForEntity(aiApiUrl, request, Map.class);

            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                logger.warn("External AI model returned non-2xx status: {}", res.getStatusCode());
                return null;
            }

            Map body = res.getBody();
            String category = Objects.toString(body.get("category"), "UNCATEGORIZED");
            double confidence = Double.parseDouble(Objects.toString(body.get("confidence"), "0.5"));

            logger.info("External model categorized transaction: {} with confidence: {}", category, confidence);
            return new CategorizeResponse(category, confidence);

        } catch (Exception e) {
            logger.warn("External AI model failed, will use fallback: {}", e.getMessage());
            return null;
        }
    }

    private CategorizeResponse ruleBased(String desc, Double amount) {
        if (desc == null) {
            desc = "";
        }

        for (Map.Entry<Pattern, String> entry : KEYWORDS.entrySet()) {
            if (entry.getKey().matcher(desc).find()) {
                logger.debug("Rule-based match found: {}", entry.getValue());
                return new CategorizeResponse(entry.getValue(), 0.75);
            }
        }

        logger.debug("No rule-based match found, returning UNCATEGORIZED");
        return new CategorizeResponse("UNCATEGORIZED", 0.3);
    }
}
