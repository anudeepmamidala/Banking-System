package com.anudeep.bankingsystem.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@Getter
@AllArgsConstructor
public class CustomPrincipal implements Serializable {
    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String email;
    private final String role;
}
