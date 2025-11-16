package com.anudeep.bankingsystem.repository;

import com.anudeep.bankingsystem.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdPaginated(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.account.id = :accountId ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.category = :category ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND LOWER(t.description) LIKE LOWER(CONCAT('%', :description, '%')) ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndDescriptionContaining(@Param("userId") Long userId, @Param("description") String description);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = :type ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND ABS(t.amount) >= :minAmount AND ABS(t.amount) <= :maxAmount ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndAmountRange(@Param("userId") Long userId, @Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'DEPOSIT'")
    BigDecimal getTotalIncome(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'WITHDRAW'")
    BigDecimal getTotalExpense(@Param("userId") Long userId);

    @Query("SELECT SUM(ABS(t.amount)) FROM Transaction t WHERE t.user.id = :userId AND t.category = :category")
    BigDecimal getSpendingByCategory(@Param("userId") Long userId, @Param("category") String category);
}
