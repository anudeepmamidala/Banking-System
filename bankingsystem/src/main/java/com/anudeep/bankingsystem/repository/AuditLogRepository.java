package com.anudeep.bankingsystem.repository;

import com.anudeep.bankingsystem.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<AuditLog> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId AND a.action = :action ORDER BY a.createdAt DESC")
    List<AuditLog> findByUserIdAndAction(@Param("userId") Long userId, @Param("action") String action);

    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId AND a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<AuditLog> findByUserIdAndDateRange(@Param("userId") Long userId, 
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);
}
