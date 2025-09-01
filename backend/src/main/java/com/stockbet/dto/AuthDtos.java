package com.stockbet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public static class RegisterRequest {
        @Email @NotBlank public String email;
        @NotBlank public String password;
    }
    public static class LoginRequest {
        @Email @NotBlank public String email;
        @NotBlank public String password;
    }
    public static class TokenResponse {
        public String token;
        public TokenResponse(String token){this.token=token;}
    }
}
