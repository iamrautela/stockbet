package com.stockbet.controller;

import com.stockbet.domain.Market;
import com.stockbet.dto.BetDtos;
import com.stockbet.service.BetService;
import com.stockbet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/bets")
@CrossOrigin(origins = "*")
public class BetController {
    private final BetService bets;
    private final UserService users;
    public BetController(BetService bets, UserService users){this.bets=bets; this.users=users;}

    @PostMapping
    public Map<String, Object> place(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                                     @Valid @RequestBody BetDtos.PlaceBetRequest req) {
        var user = users.byEmail(principal.getUsername());
        var bet = bets.placeBet(user.getId(), req.marketId, Market.Outcome.valueOf(req.outcome), req.amount);
        return Map.of("betId", bet.getId());
    }
}
