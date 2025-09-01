package com.stockbet.service;

import com.stockbet.domain.*;
import com.stockbet.repository.BetRepository;
import com.stockbet.repository.MarketRepository;
import com.stockbet.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class BetService {
    private final BetRepository bets;
    private final MarketRepository markets;
    private final UserRepository users;
    private final WalletService walletService;

    public BetService(BetRepository bets, MarketRepository markets, UserRepository users, WalletService walletService) {
        this.bets=bets; this.markets=markets; this.users=users; this.walletService=walletService;
    }

    @Transactional
    public Bet placeBet(UUID userId, UUID marketId, Market.Outcome outcome, BigDecimal amount) {
        var user = users.findById(userId).orElseThrow();
        var market = markets.findById(marketId).orElseThrow();
        if (market.getStatus() != Market.Status.OPEN) throw new IllegalStateException("Market not open");

        var wallet = walletService.walletFor(user);
        walletService.withdrawForBet(wallet, amount, "bet:" + market.getId());

        Bet b = new Bet();
        b.setUser(user); b.setMarket(market); b.setOutcome(outcome); b.setAmount(amount);
        return bets.save(b);
    }

    @Transactional
    public void settle(UUID marketId) {
        var market = markets.findById(marketId).orElseThrow();
        if (market.getStatus() != Market.Status.RESOLVED) throw new IllegalStateException("Market not resolved");
        var all = bets.findByMarket(market);
        BigDecimal fee = new BigDecimal("0.02"); // 2% fee
        BigDecimal pool = all.stream().map(Bet::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal upPool = all.stream().filter(b -> b.getOutcome() == Market.Outcome.UP).map(Bet::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal downPool = pool.subtract(upPool);
        Market.Outcome winner = market.getResolution();
        BigDecimal winningPool = (winner == Market.Outcome.UP) ? upPool : downPool;
        if (winningPool.compareTo(BigDecimal.ZERO) == 0) {
            // refund all
            for (Bet b : all) {
                b.setStatus(Bet.Status.REFUNDED);
                b.setPayout(b.getAmount());
                bets.save(b);
                var w = walletService.walletFor(b.getUser());
                walletService.creditPayout(w, b.getAmount(), "refund:" + b.getId());
            }
            return;
        }
        BigDecimal distributable = pool.multiply(BigDecimal.ONE.subtract(fee));
        for (Bet b : all) {
            if (b.getOutcome() == winner) {
                BigDecimal share = b.getAmount().divide(winningPool, 12, RoundingMode.HALF_UP);
                BigDecimal payout = distributable.multiply(share).setScale(2, RoundingMode.DOWN);
                b.setStatus(Bet.Status.WON); b.setPayout(payout); bets.save(b);
                var w = walletService.walletFor(b.getUser());
                walletService.creditPayout(w, payout, "payout:" + b.getId());
            } else {
                b.setStatus(Bet.Status.LOST); b.setPayout(BigDecimal.ZERO); bets.save(b);
            }
        }
    }
}
