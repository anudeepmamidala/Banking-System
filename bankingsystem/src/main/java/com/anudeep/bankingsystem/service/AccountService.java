package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.dto.account.*;
import com.anudeep.bankingsystem.entity.Account;
import com.anudeep.bankingsystem.entity.AppUser;
import com.anudeep.bankingsystem.exception.ApiException;
import com.anudeep.bankingsystem.repository.AccountRepository;
import com.anudeep.bankingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository repo;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponse create(Long userId, AccountRequest req) {
        logger.info("Creating account for user: {}", userId);
        
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        String name = req.getName().trim();

        if (repo.existsByUserAndName(user, name)) {
            logger.warn("Account with name {} already exists for user: {}", name, userId);
            throw new ApiException("Account with this name already exists");
        }

        Account acc = Account.builder()
                .user(user)
                .name(name)
                .type(req.getType())
                .balance(BigDecimal.ZERO)
                .build();

        repo.save(acc);
        logger.info("Account created successfully with id: {}", acc.getId());

        return toResponse(acc);
    }

    public List<AccountResponse> listForUser(Long userId) {
        logger.info("Fetching accounts for user: {}", userId);
        
        return repo.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AccountResponse get(Long userId, Long accountId) {
        logger.info("Fetching account {} for user: {}", accountId, userId);
        
        Account acc = repo.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException("Account not found"));

        return toResponse(acc);
    }

    @Transactional
    public AccountResponse update(Long userId, Long accountId, AccountRequest req) {
        logger.info("Updating account {} for user: {}", accountId, userId);
        
        Account acc = repo.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException("Account not found"));

        String newName = req.getName().trim();

        if (!acc.getName().equals(newName) &&
                repo.existsByUserAndName(acc.getUser(), newName)) {
            logger.warn("Account name {} already exists for user: {}", newName, userId);
            throw new ApiException("Account name already exists");
        }

        acc.setName(newName);
        acc.setType(req.getType());
        repo.save(acc);
        
        logger.info("Account {} updated successfully", accountId);

        return toResponse(acc);
    }

    @Transactional
    public void delete(Long userId, Long accountId) {
        logger.info("Deleting account {} for user: {}", accountId, userId);
        
        Account acc = repo.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException("Account not found"));

        if (acc.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            logger.warn("Cannot delete account {} with non-zero balance", accountId);
            throw new ApiException("Cannot delete account with non-zero balance");
        }

        repo.delete(acc);
        logger.info("Account {} deleted successfully", accountId);
    }

    private AccountResponse toResponse(Account acc) {
        return new AccountResponse(
                acc.getId(),
                acc.getName(),
                acc.getType(),
                acc.getBalance()
        );
    }
}
