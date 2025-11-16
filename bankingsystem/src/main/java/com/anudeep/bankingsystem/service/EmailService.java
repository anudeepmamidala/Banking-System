package com.anudeep.bankingsystem.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    /**
     * Simple email sending method for testing purposes
     * No async - returns immediately after sending
     */
    public void sendSimpleEmail(String to, String subject, String body) throws MessagingException {
        if (!mailEnabled) {
            logger.debug("Email notifications are disabled");
            throw new IllegalStateException("Email service is disabled. Set app.mail.enabled=true in .env");
        }

        try {
            sendHtmlEmail(to, subject, body);
            logger.info("Test email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send simple email to: {}", to, e);
            throw e;
        }
    }

    @Async
    public void sendTransactionConfirmation(String recipientEmail, String fullName, 
                                           String transactionType, String amount, String accountName) {
        if (!mailEnabled) {
            logger.debug("Email notifications are disabled");
            return;
        }

        try {
            String subject = "Transaction Confirmation - " + transactionType;
            String htmlBody = buildTransactionEmailBody(fullName, transactionType, amount, accountName);

            sendHtmlEmail(recipientEmail, subject, htmlBody);
            logger.info("Transaction confirmation email sent to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send transaction confirmation email", e);
        }
    }

    @Async
    public void sendPasswordChangeAlert(String recipientEmail, String fullName) {
        if (!mailEnabled) {
            logger.debug("Email notifications are disabled");
            return;
        }

        try {
            String subject = "Password Changed - Security Alert";
            String htmlBody = buildPasswordChangeEmailBody(fullName);

            sendHtmlEmail(recipientEmail, subject, htmlBody);
            logger.info("Password change alert email sent to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send password change alert email", e);
        }
    }

    @Async
    public void sendAccountDeletionAlert(String recipientEmail, String fullName) {
        if (!mailEnabled) {
            logger.debug("Email notifications are disabled");
            return;
        }

        try {
            String subject = "Account Deleted - Confirmation";
            String htmlBody = buildAccountDeletionEmailBody(fullName);

            sendHtmlEmail(recipientEmail, subject, htmlBody);
            logger.info("Account deletion confirmation email sent to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send account deletion email", e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    private String buildTransactionEmailBody(String fullName, String transactionType, String amount, String accountName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        return "<html><body style=\"font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;\">" +
                "<h2 style=\"color: #333;\">Transaction Confirmation</h2>" +
                "<p>Dear " + fullName + ",</p>" +
                "<p>Your transaction has been processed successfully.</p>" +
                "<div style=\"background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px;\">" +
                "<p><strong>Transaction Type:</strong> " + transactionType + "</p>" +
                "<p><strong>Amount:</strong> " + amount + "</p>" +
                "<p><strong>Account:</strong> " + accountName + "</p>" +
                "<p><strong>Date & Time:</strong> " + timestamp + "</p>" +
                "</div>" +
                "<p style=\"color: #666; font-size: 12px;\">If you did not authorize this transaction, please contact us immediately.</p>" +
                "<p>Thank you,<br/><strong>Banking System Team</strong></p>" +
                "</div></body></html>";
    }

    private String buildPasswordChangeEmailBody(String fullName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        return "<html><body style=\"font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;\">" +
                "<h2 style=\"color: #333;\">Password Changed</h2>" +
                "<p>Dear " + fullName + ",</p>" +
                "<p>Your account password has been changed successfully.</p>" +
                "<p><strong>Changed on:</strong> " + timestamp + "</p>" +
                "<p style=\"color: #d32f2f;\"><strong>⚠️ If you did not make this change, please reset your password immediately.</strong></p>" +
                "<p>Thank you,<br/><strong>Banking System Team</strong></p>" +
                "</div></body></html>";
    }

    private String buildAccountDeletionEmailBody(String fullName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        return "<html><body style=\"font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;\">" +
                "<h2 style=\"color: #333;\">Account Deleted</h2>" +
                "<p>Dear " + fullName + ",</p>" +
                "<p>Your account has been permanently deleted.</p>" +
                "<p><strong>Deleted on:</strong> " + timestamp + "</p>" +
                "<p style=\"color: #666; font-size: 12px;\">If you have any questions or this was done in error, please contact our support team.</p>" +
                "<p>Thank you,<br/><strong>Banking System Team</strong></p>" +
                "</div></body></html>";
    }
}
