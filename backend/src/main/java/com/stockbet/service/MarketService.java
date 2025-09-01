package com.stockbet.service;

import com.stockbet.domain.Market;
import com.stockbet.repository.BetRepository;
import com.stockbet.repository.MarketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MarketService {
    private final MarketRepository markets;
    private final BetRepository bets;

    public MarketService(MarketRepository markets, BetRepository bets) { this.markets=markets; this.bets=bets; }

    public List<Market> list() { return markets.findAll(); }
    public Market get(UUID id) { return markets.findById(id).orElseThrow(); }

    public Market create(String symbol, String title, String description, Instant resolveBy) {
        Market m = new Market();
        m.setSymbol(symbol); m.setTitle(title); m.setDescription(description); m.setResolveBy(resolveBy);
        return markets.save(m);
    }

    @Transactional
    public Market close(UUID id) {
        Market m = get(id);
        m.setStatus(Market.Status.CLOSED);
        return markets.save(m);
    }

    @Transactional
    public Market resolve(UUID id, Market.Outcome outcome) {
        Market m = get(id);
        m.setStatus(Market.Status.RESOLVED);
        m.setResolution(outcome);
        return markets.save(m);
    }
}
