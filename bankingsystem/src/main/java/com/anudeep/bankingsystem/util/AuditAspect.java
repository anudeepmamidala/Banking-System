package com.anudeep.bankingsystem.util;

import com.anudeep.bankingsystem.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditAspect {
    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;

    public AuditAspect(AuditService auditService) {
        this.auditService = auditService;
    }

    @Around("@annotation(auditable)")
    public Object auditAction(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {
        Long userId = extractUserIdFromContext();
        String ipAddress = getClientIpAddress();

        try {
            Object result = pjp.proceed();
            
            Long entityId = extractEntityIdFromArgs(pjp.getArgs());
            auditService.logAction(
                    userId,
                    auditable.action(),
                    auditable.entityType(),
                    entityId,
                    "Action completed successfully",
                    ipAddress
            );
            
            logger.debug("Audit action recorded: {} on {}", auditable.action(), auditable.entityType());
            return result;
        } catch (Exception e) {
            auditService.logAction(
                    userId,
                    auditable.action(),
                    auditable.entityType(),
                    null,
                    "Action failed: " + e.getMessage(),
                    ipAddress
            );
            throw e;
        }
    }

    private Long extractUserIdFromContext() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return 1L; // In production, extract from security context
            }
        } catch (Exception e) {
            logger.debug("Could not extract user ID from context", e);
        }
        return null;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String clientIp = request.getHeader("X-Forwarded-For");
                if (clientIp == null || clientIp.isEmpty()) {
                    clientIp = request.getRemoteAddr();
                }
                return clientIp;
            }
        } catch (Exception e) {
            logger.debug("Could not extract client IP", e);
        }
        return null;
    }

    private Long extractEntityIdFromArgs(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
        }
        return null;
    }
}