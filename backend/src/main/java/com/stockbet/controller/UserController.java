package com.stockbet.controller;

import com.stockbet.domain.User;
import com.stockbet.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users=users; }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User u = users.byEmail(principal.getUsername());
        var w = users.walletOf(u);
        return Map.of("id", u.getId(), "email", u.getEmail(), "role", u.getRole(), "balance", w.getBalance());
    }
}
