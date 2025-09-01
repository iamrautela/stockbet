package com.stockbet.controller;

import com.stockbet.dto.AuthDtos;
import com.stockbet.security.JwtService;
import com.stockbet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService users;
    private final JwtService jwt;
    private final PasswordEncoder encoder;

    public AuthController(UserService users, JwtService jwt, PasswordEncoder encoder) {
        this.users=users; this.jwt=jwt; this.encoder=encoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        var u = users.register(req.email, req.password);
        var token = jwt.issue(java.util.Map.of("sub", u.getEmail(), "role", "USER"));
        return ResponseEntity.ok(new AuthDtos.TokenResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        var u = users.byEmail(req.email);
        if (!encoder.matches(req.password, u.getPasswordHash())) throw new BadCredentialsException("Invalid credentials");
        var token = jwt.issue(java.util.Map.of("sub", u.getEmail(), "role", "USER"));
        return ResponseEntity.ok(new AuthDtos.TokenResponse(token));
    }
}
