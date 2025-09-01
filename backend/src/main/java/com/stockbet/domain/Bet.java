package com.stockbet.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="bets")
public class Bet {
    public enum Status { PENDING, WON, LOST, REFUNDED }

    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne @JoinColumn(name="market_id", nullable=false)
    private Market market;

    @Enumerated(EnumType.STRING)
    private Market.Outcome outcome;

    @Column(nullable=false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private BigDecimal payout;

    @Column(name="created_at", nullable=false)
    private Instant createdAt = Instant.now();

    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public User getUser(){return user;}
    public void setUser(User u){this.user=u;}
    public Market getMarket(){return market;}
    public void setMarket(Market m){this.market=m;}
    public Market.Outcome getOutcome(){return outcome;}
    public void setOutcome(Market.Outcome o){this.outcome=o;}
    public BigDecimal getAmount(){return amount;}
    public void setAmount(BigDecimal a){this.amount=a;}
    public Status getStatus(){return status;}
    public void setStatus(Status s){this.status=s;}
    public BigDecimal getPayout(){return payout;}
    public void setPayout(BigDecimal p){this.payout=p;}
    public Instant getCreatedAt(){return createdAt;}
    public void setCreatedAt(Instant c){this.createdAt=c;}
}
