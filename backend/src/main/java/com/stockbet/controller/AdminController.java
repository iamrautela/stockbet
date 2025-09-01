package com.stockbet.controller;

import com.stockbet.domain.Market;
import com.stockbet.service.BetService;
import com.stockbet.service.MarketService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    private final MarketService markets;
    private final BetService bets;
    public AdminController(MarketService markets, BetService bets){this.markets=markets; this.bets=bets;}

    @PostMapping("/markets/{id}/close")
    public Map<String, Object> close(@PathVariable UUID id){
        var m = markets.close(id);
        return Map.of("status", m.getStatus().toString());
    }

    @PostMapping("/markets/{id}/resolve")
    public Map<String, Object> resolve(@PathVariable UUID id, @RequestBody Map<String, String> body){
        var m = markets.resolve(id, Market.Outcome.valueOf(body.get("resolution")));
        bets.settle(id);
        return Map.of("status", m.getStatus().toString(), "resolution", m.getResolution().toString());
    }
}
