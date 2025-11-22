package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.dto.PaginatedResponse;
import com.anudeep.bankingsystem.dto.account.AccountResponse;
import com.anudeep.bankingsystem.dto.transaction.*;
import com.anudeep.bankingsystem.entity.*;
import com.anudeep.bankingsystem.exception.ApiException;
import com.anudeep.bankingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;
    private final UserRepository userRepository;
    private final AiService aiService;

    @Transactional
    public TransactionResponse deposit(Long userId, TransactionRequest req) {
        logger.info("Processing deposit for user: {} amount: {}", userId, req.getAmount());
        
        // Validate user exists
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        // Validate account exists
        Account acc = accountRepo.findById(req.getFromAccountId())
                .orElseThrow(() -> new ApiException("Account not found"));

        // Verify user owns this account
        if (acc.getUser() == null || !acc.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized deposit attempt for account {} by user: {}", req.getFromAccountId(), userId);
            throw new ApiException("Not your account");
        }

        BigDecimal amount = req.getAmount();

        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid deposit amount: {}", amount);
            throw new ApiException("Amount must be positive");
        }

        // Update account balance
        acc.setBalance(acc.getBalance().add(amount));
        accountRepo.save(acc);

        // Create transaction
        Transaction t = Transaction.builder()
                .account(acc)
                .user(user)
                .amount(amount)
                .type("DEPOSIT")
                .description(req.getDescription())
                .build();

        txnRepo.save(t);
        
        // Categorize asynchronously (won't throw exceptions)
        aiService.categorizeTransaction(t);
        
        logger.info("Deposit completed successfully for user: {} transaction id: {}", userId, t.getId());

        return toResponse(t);
    }

    @Transactional
    public TransactionResponse withdraw(Long userId, TransactionRequest req) {
        logger.info("Processing withdrawal for user: {} amount: {}", userId, req.getAmount());
        
        // Validate user exists
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        // Validate account exists
        Account acc = accountRepo.findById(req.getFromAccountId())
                .orElseThrow(() -> new ApiException("Account not found"));

        // Verify user owns this account
        if (acc.getUser() == null || !acc.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized withdrawal attempt for account {} by user: {}", req.getFromAccountId(), userId);
            throw new ApiException("Not your account");
        }

        BigDecimal amount = req.getAmount();

        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid withdrawal amount: {}", amount);
            throw new ApiException("Amount must be positive");
        }

        // Check sufficient balance
        if (acc.getBalance().compareTo(amount) < 0) {
            logger.warn("Insufficient balance for withdrawal. Account: {} Balance: {} Amount: {}", 
                    req.getFromAccountId(), acc.getBalance(), amount);
            throw new ApiException("Insufficient balance");
        }

        // Update account balance
        acc.setBalance(acc.getBalance().subtract(amount));
        accountRepo.save(acc);

        // Create transaction
        Transaction t = Transaction.builder()
                .account(acc)
                .user(user)
                .amount(amount.negate())
                .type("WITHDRAW")
                .description(req.getDescription())
                .build();

        txnRepo.save(t);
        
        // Categorize asynchronously (won't throw exceptions)
        aiService.categorizeTransaction(t);
        
        logger.info("Withdrawal completed successfully for user: {} transaction id: {}", userId, t.getId());

        return toResponse(t);
    }

    @Transactional
    public TransactionResponse transfer(Long userId, TransactionRequest req) {
        logger.info("Processing transfer for user: {} amount: {} from: {} to: {}", 
                userId, req.getAmount(), req.getFromAccountId(), req.getToAccountId());
        
        Long fromId = req.getFromAccountId();
        Long toId = req.getToAccountId();

        // FIX #1: Add null check for toAccountId
        if (toId == null) {
            logger.warn("To account ID is null for user: {}", userId);
            throw new ApiException("To account ID is required for transfer");
        }

        // Check if trying to transfer to same account
        if (fromId.equals(toId)) {
            logger.warn("Cannot transfer to same account for user: {}", userId);
            throw new ApiException("Cannot transfer to same account");
        }

        // Validate user exists
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        // Validate from account exists
        Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new ApiException("From account not found"));

        // Verify user owns from account
        if (from.getUser() == null || !from.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized transfer attempt for account {} by user: {}", fromId, userId);
            throw new ApiException("Not your account");
        }

        // Validate to account exists
        Account to = accountRepo.findById(toId)
                .orElseThrow(() -> new ApiException("To account not found"));

        BigDecimal amount = req.getAmount();

        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid transfer amount: {}", amount);
            throw new ApiException("Amount must be positive");
        }

        // Check sufficient balance
        if (from.getBalance().compareTo(amount) < 0) {
            logger.warn("Insufficient balance for transfer. From Account: {} Balance: {} Amount: {}", 
                    fromId, from.getBalance(), amount);
            throw new ApiException("Insufficient balance");
        }

        // Update both account balances
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        accountRepo.save(from);
        accountRepo.save(to);

        // Create outgoing transaction
        Transaction out = Transaction.builder()
                .account(from)
                .relatedAccount(to)
                .user(user)
                .amount(amount.negate())
                .type("TRANSFER_OUT")
                .description(req.getDescription())
                .build();

        // Create incoming transaction
        Transaction in = Transaction.builder()
                .account(to)
                .relatedAccount(from)
                .user(user)
                .amount(amount)
                .type("TRANSFER_IN")
                .description(req.getDescription())
                .build();

        txnRepo.save(out);
        txnRepo.save(in);

        // Categorize both transactions asynchronously (won't throw exceptions)
        aiService.categorizeTransaction(out);
        aiService.categorizeTransaction(in);
        
        logger.info("Transfer completed successfully for user: {} transaction id: {}", userId, out.getId());

        return toResponse(out);
    }

    public List<TransactionResponse> listForUser(Long userId) {
        logger.info("Fetching transaction history for user: {}", userId);
        
        return txnRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Pagination
    public PaginatedResponse<TransactionResponse> listForUserPaginated(Long userId, int page, int size) {
        logger.info("Fetching paginated transactions for user: {} page: {} size: {}", userId, page, size);
        
        Page<Transaction> transactions = txnRepo.findByUserIdPaginated(
                userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return PaginatedResponse.<TransactionResponse>builder()
                .content(transactions.getContent().stream().map(this::toResponse).toList())
                .page(page)
                .size(size)
                .totalElements(transactions.getTotalElements())
                .totalPages(transactions.getTotalPages())
                .hasNext(transactions.hasNext())
                .hasPrevious(transactions.hasPrevious())
                .build();
    }

    // Filtering
    public List<TransactionResponse> filterTransactions(Long userId, TransactionFilterRequest filter) {
        logger.info("Filtering transactions for user: {}", userId);
        
        List<Transaction> transactions = txnRepo.findByUserIdOrderByCreatedAtDesc(userId);

        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            transactions = transactions.stream()
                    .filter(t -> t.getCreatedAt().isAfter(filter.getStartDate()) 
                            && t.getCreatedAt().isBefore(filter.getEndDate()))
                    .toList();
        }

        if (filter.getCategory() != null && !filter.getCategory().isEmpty()) {
            transactions = transactions.stream()
                    .filter(t -> t.getCategory() != null && t.getCategory().equals(filter.getCategory()))
                    .toList();
        }

        if (filter.getType() != null && !filter.getType().isEmpty()) {
            transactions = transactions.stream()
                    .filter(t -> t.getType().equals(filter.getType()))
                    .toList();
        }

        if (filter.getMinAmount() != null || filter.getMaxAmount() != null) {
            BigDecimal min = filter.getMinAmount() != null ? filter.getMinAmount() : BigDecimal.ZERO;
            BigDecimal max = filter.getMaxAmount() != null ? filter.getMaxAmount() : new BigDecimal("999999999");
            
            transactions = transactions.stream()
                    .filter(t -> {
                        BigDecimal absAmount = t.getAmount().abs();
                        return absAmount.compareTo(min) >= 0 && absAmount.compareTo(max) <= 0;
                    })
                    .toList();
        }

        logger.info("Filtered {} transactions for user: {}", transactions.size(), userId);
        return transactions.stream().map(this::toResponse).toList();
    }

    // Search
    public List<TransactionResponse> searchTransactions(Long userId, String query) {
        logger.info("Searching transactions for user: {} with query: {}", userId, query);
        
        if (query == null || query.isBlank()) {
            logger.warn("Empty search query for user: {}", userId);
            return List.of();
        }
        
        return txnRepo.findByUserIdAndDescriptionContaining(userId, query)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get by category
    public List<TransactionResponse> getTransactionsByCategory(Long userId, String category) {
        logger.info("Fetching transactions by category: {} for user: {}", category, userId);
        
        if (category == null || category.isBlank()) {
            logger.warn("Empty category for user: {}", userId);
            return List.of();
        }
        
        return txnRepo.findByUserIdAndCategory(userId, category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get by type
    public List<TransactionResponse> getTransactionsByType(Long userId, String type) {
        logger.info("Fetching transactions by type: {} for user: {}", type, userId);
        
        if (type == null || type.isBlank()) {
            logger.warn("Empty type for user: {}", userId);
            return List.of();
        }
        
        return txnRepo.findByUserIdAndType(userId, type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get by date range
    public List<TransactionResponse> getTransactionsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching transactions between {} and {} for user: {}", startDate, endDate, userId);
        
        if (startDate == null || endDate == null) {
            logger.warn("Invalid date range for user: {}", userId);
            return List.of();
        }
        
        return txnRepo.findByUserIdAndDateRange(userId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get transaction details with related account info
    public TransactionDetailResponse getTransactionDetails(Long userId, Long transactionId) {
        logger.info("Fetching transaction details for user: {} transaction: {}", userId, transactionId);
        
        Transaction t = txnRepo.findById(transactionId)
                .orElseThrow(() -> new ApiException("Transaction not found"));

        if (t.getUser() == null || !t.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized access to transaction {} by user: {}", transactionId, userId);
            throw new ApiException("Unauthorized: Transaction does not belong to you");
        }

        // FIX #2: Handle null account gracefully
        if (t.getAccount() == null) {
            logger.error("Transaction {} has null account", transactionId);
            throw new ApiException("Transaction has invalid account reference");
        }

        // --- START OF NEW LOGIC ---
        String recipientUserName = null;
        Account relatedAccount = t.getRelatedAccount();

        // Check if there is a related account (i.e., it's a transfer)
        if (relatedAccount != null) {
            // Check if the transaction type implies a transfer to a known entity
            if ("TRANSFER_OUT".equals(t.getType()) || "TRANSFER_IN".equals(t.getType())) {
                try {
                    // Fetch the User Name using the AccountRepository method
                    recipientUserName = accountRepo.findUserNameByAccountId(relatedAccount.getId());
                } catch (Exception e) {
                    logger.error("Could not find User Name for related account ID: {}", relatedAccount.getId(), e);
                    // Fallback to null or a default message
                    recipientUserName = "Unknown User"; 
                }
            }
        }
        // --- END OF NEW LOGIC ---


        AccountResponse accountResp = new AccountResponse(
                t.getAccount().getId(),
                t.getAccount().getName(),
                t.getAccount().getType(),
                t.getAccount().getBalance()
        );

        AccountResponse relatedAccountResp = null;
        if (relatedAccount != null) {
            relatedAccountResp = new AccountResponse(
                    relatedAccount.getId(),
                    relatedAccount.getName(),
                    relatedAccount.getType(),
                    relatedAccount.getBalance()
            );
        }

        String merchant = extractMerchantFromDescription(t.getDescription());

        logger.info("Transaction details retrieved successfully for transaction: {}", transactionId);

        // **UPDATED DTO CONSTRUCTOR** to include the new field
        return new TransactionDetailResponse(
                t.getId(),
                accountResp,
                relatedAccountResp,
                // NEW FIELD
                recipientUserName, 
                t.getAmount(),
                t.getType(),
                t.getCategory(),
                t.getCategoryConfidence(),
                t.getDescription(),
                merchant,
                t.getCreatedAt()
        );
    }

    private TransactionResponse toResponse(Transaction t) {
        // FIX #3: Handle null account gracefully
        if (t == null || t.getAccount() == null) {
            logger.error("Invalid transaction or account reference");
            return null;
        }

        return new TransactionResponse(
                t.getId(),
                t.getAccount().getId(),
                t.getAmount(),
                t.getType(),
                t.getDescription(),
                t.getCreatedAt()
        );
    }

    private String extractMerchantFromDescription(String description) {
        if (description == null || description.isEmpty()) {
            return null;
        }
        String[] parts = description.split(" ");
        return parts.length > 0 ? parts[0] : description;
    }
}