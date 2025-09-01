package com.stockbet.service;

import com.stockbet.domain.User;
import com.stockbet.domain.Transaction;
import com.stockbet.domain.Wallet;
import com.stockbet.repository.TransactionRepository;
import com.stockbet.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {
    final WalletRepository wallets;
    final TransactionRepository txs;

    public WalletService(WalletRepository wallets, TransactionRepository txs) { this.wallets=wallets; this.txs=txs; }

    public Wallet walletFor(User u) { return wallets.findByUser(u).orElseThrow(); }

    @Transactional
    public Wallet deposit(Wallet w, BigDecimal amount, String ref) {
        w.setBalance(w.getBalance().add(amount));
        wallets.save(w);
        Transaction t = new Transaction();
        t.setWallet(w); t.setType(Transaction.Type.DEPOSIT); t.setAmount(amount); t.setReference(ref);
        txs.save(t);
        return w;
    }

    @Transactional
    public void withdrawForBet(Wallet w, BigDecimal amount, String ref) {
        if (w.getBalance().compareTo(amount) < 0) throw new IllegalArgumentException("Insufficient balance");
        w.setBalance(w.getBalance().subtract(amount));
        wallets.save(w);
        Transaction t = new Transaction();
        t.setWallet(w); t.setType(Transaction.Type.BET_WAGER); t.setAmount(amount.negate()); t.setReference(ref);
        txs.save(t);
    }

    @Transactional
    public void creditPayout(Wallet w, BigDecimal amount, String ref) {
        w.setBalance(w.getBalance().add(amount));
        wallets.save(w);
        Transaction t = new Transaction();
        t.setWallet(w); t.setType(Transaction.Type.BET_PAYOUT); t.setAmount(amount); t.setReference(ref);
        txs.save(t);
    }
}
