package com.stockbet.controller;

import com.stockbet.service.UserService;
import com.stockbet.service.WalletService;
import jakarta.validation.constraints.Positive;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {
    private final UserService users;
    private final WalletService wallets;
    public WalletController(UserService users, WalletService wallets){this.users=users; this.wallets=wallets;}

    @PostMapping("/deposit")
    public Map<String, Object> deposit(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                                       @RequestBody Map<String, Object> body) {
        var amount = new BigDecimal(body.get("amount").toString());
        var user = users.byEmail(principal.getUsername());
        var wallet = users.walletOf(user);
        wallets.deposit(wallet, amount, "manual-deposit");
        return Map.of("balance", wallet.getBalance());
    }
}
