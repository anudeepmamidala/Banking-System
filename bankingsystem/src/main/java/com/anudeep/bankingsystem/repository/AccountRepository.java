package com.anudeep.bankingsystem.repository;

import com.anudeep.bankingsystem.entity.Account;
import com.anudeep.bankingsystem.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserOrderByCreatedAtDesc(AppUser user);

    Optional<Account> findByIdAndUser(Long id, AppUser user);

    boolean existsByUserAndName(AppUser user, String name);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Account> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM Account a WHERE a.id = :id AND a.user.id = :userId")
    Optional<Account> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);

    @Query("SELECT a.user.fullName FROM Account a WHERE a.id = :userId")
    String findUserNameByAccountId(@Param("userId") Long userId);
    
}