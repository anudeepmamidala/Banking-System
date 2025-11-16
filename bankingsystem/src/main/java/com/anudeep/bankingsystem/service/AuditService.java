package com.anudeep.bankingsystem.service;

import com.anudeep.bankingsystem.entity.AppUser;
import com.anudeep.bankingsystem.entity.AuditLog;
import com.anudeep.bankingsystem.repository.AuditLogRepository;
import com.anudeep.bankingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuditService {
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            Optional<AppUser> user = userRepository.findById(userId);
            
            AuditLog auditLog = AuditLog.builder()
                    .user(user.orElse(null))
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            logger.debug("Audit log created: user={}, action={}, entity={}", userId, action, entityType);
        } catch (Exception e) {
            logger.error("Failed to create audit log", e);
        }
    }

    public void logAction(Long userId, String action, String entityType, Long entityId, String details) {
        logAction(userId, action, entityType, entityId, details, null);
    }

    public List<AuditLog> getUserAuditLogs(Long userId) {
        logger.info("Fetching audit logs for user: {}", userId);
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getUserAuditLogsByAction(Long userId, String action) {
        logger.info("Fetching audit logs for user: {} action: {}", userId, action);
        return auditLogRepository.findByUserIdAndAction(userId, action);
    }

    public List<AuditLog> getUserAuditLogsByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching audit logs for user: {} between {} and {}", userId, startDate, endDate);
        return auditLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }
}
