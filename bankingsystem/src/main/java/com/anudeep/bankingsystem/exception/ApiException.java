package com.anudeep.bankingsystem.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) { super(message); }
    public ApiException(String message, Throwable t) { super(message, t); }
}
