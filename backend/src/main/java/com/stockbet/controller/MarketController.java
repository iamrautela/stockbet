package com.stockbet.controller;

import com.stockbet.domain.Market;
import com.stockbet.service.MarketService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/markets")
@CrossOrigin(origins = "*")
public class MarketController {
    private final MarketService markets;
    public MarketController(MarketService markets){this.markets=markets;}

    @GetMapping
    public List<Market> list(){ return markets.list(); }

    @PostMapping
    public Market create(@RequestBody Map<String, String> body){
        return markets.create(body.get("symbol"), body.get("title"), body.get("description"), Instant.parse(body.get("resolveBy")));
    }
}
