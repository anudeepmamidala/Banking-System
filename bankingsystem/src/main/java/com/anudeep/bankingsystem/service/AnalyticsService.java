package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.dto.analytics.*;
import com.anudeep.bankingsystem.entity.Account;
import com.anudeep.bankingsystem.entity.Transaction;
import com.anudeep.bankingsystem.repository.AccountRepository;
import com.anudeep.bankingsystem.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    private final TransactionRepository txnRepo;
    private final AccountRepository accRepo;

    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        logger.info("Generating dashboard summary for user: {}", userId);

        List<Account> accounts = accRepo.findByUserId(userId);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = txnRepo.getTotalIncome(userId);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = txnRepo.getTotalExpense(userId);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.add(totalExpense);

        int transactionCount = txnRepo.countByUserId(userId);
        int accountCount = accounts.size();

        logger.info("Dashboard summary generated: balance={}, income={}, expense={}", 
                totalBalance, totalIncome, totalExpense);

        return DashboardSummaryResponse.builder()
                .totalBalance(totalBalance)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense.abs())
                .netSavings(netSavings)
                .transactionCount(transactionCount)
                .accountCount(accountCount)
                .build();
    }

    public SpendingByCategoryResponse getSpendingByCategory(Long userId) {
        logger.info("Generating spending by category for user: {}", userId);

        List<Transaction> transactions = txnRepo.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, BigDecimal> categorySpending = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                t -> t.getAmount().abs(),
                                BigDecimal::add
                        )
                ));

        Map<String, Integer> categoryCount = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingInt(t -> 1)
                ));

        BigDecimal totalSpending = categorySpending.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        logger.info("Spending by category: {} categories found", categorySpending.size());

        return SpendingByCategoryResponse.builder()
                .categorySpending(categorySpending)
                .categoryCount(categoryCount)
                .totalSpending(totalSpending)
                .build();
    }

    public List<MonthlySummaryResponse> getMonthlySummary(Long userId, int months) {
        logger.info("Generating monthly summary for user: {} last {} months", userId, months);

        List<Transaction> transactions = txnRepo.findByUserIdOrderByCreatedAtDesc(userId);

        Map<YearMonth, List<Transaction>> groupedByMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> 
                        YearMonth.from(t.getCreatedAt())
                ));

        List<MonthlySummaryResponse> monthlySummaries = new ArrayList<>();

        for (int i = 0; i < months; i++) {
            YearMonth month = YearMonth.now().minusMonths(i);
            List<Transaction> monthTransactions = groupedByMonth.getOrDefault(month, new ArrayList<>());

            BigDecimal income = monthTransactions.stream()
                    .filter(t -> t.getType().equals("DEPOSIT"))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = monthTransactions.stream()
                    .filter(t -> t.getType().equals("WITHDRAW"))
                    .map(t -> t.getAmount().abs())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal netChange = income.subtract(expense);

            monthlySummaries.add(MonthlySummaryResponse.builder()
                    .month(month)
                    .income(income)
                    .expense(expense)
                    .netChange(netChange)
                    .transactionCount(monthTransactions.size())
                    .build());
        }

        logger.info("Monthly summary generated for {} months", months);
        return monthlySummaries;
    }

    public List<AccountSummaryResponse> getAccountSummary(Long userId) {
        logger.info("Generating account summary for user: {}", userId);

        List<Account> accounts = accRepo.findByUserId(userId);

        return accounts.stream()
                .map(acc -> {
                    int transactionCount = (int) txnRepo.findByAccountIdOrderByCreatedAtDesc(acc.getId())
                            .stream().count();
                    
                    return AccountSummaryResponse.builder()
                            .accountId(acc.getId())
                            .name(acc.getName())
                            .type(acc.getType())
                            .balance(acc.getBalance())
                            .transactionCount(transactionCount)
                            .build();
                })
                .toList();
    }
}
