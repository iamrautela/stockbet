package com.stockbet.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name="wallets")
public class Wallet {
    @Id
    private UUID id = UUID.randomUUID();
    @OneToOne
    @JoinColumn(name="user_id", nullable=false)
    private User user;
    @Column(nullable=false)
    private BigDecimal balance = BigDecimal.ZERO;

    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public User getUser(){return user;}
    public void setUser(User u){this.user=u;}
    public BigDecimal getBalance(){return balance;}
    public void setBalance(BigDecimal b){this.balance=b;}
}
