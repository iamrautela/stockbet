package com.stockbet.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="transactions")
public class Transaction {
    public enum Type { DEPOSIT, WITHDRAWAL, BET_WAGER, BET_PAYOUT, REFUND }

    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne @JoinColumn(name="wallet_id", nullable=false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(nullable=false)
    private BigDecimal amount;

    private String reference;

    @Column(name="created_at", nullable=false)
    private Instant createdAt = Instant.now();

    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public Wallet getWallet(){return wallet;}
    public void setWallet(Wallet w){this.wallet=w;}
    public Type getType(){return type;}
    public void setType(Type t){this.type=t;}
    public BigDecimal getAmount(){return amount;}
    public void setAmount(BigDecimal a){this.amount=a;}
    public String getReference(){return reference;}
    public void setReference(String r){this.reference=r;}
    public Instant getCreatedAt(){return createdAt;}
    public void setCreatedAt(Instant c){this.createdAt=c;}
}
