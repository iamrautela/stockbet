package com.stockbet.bet;


import com.stockbet.user.User;
import com.stockbet.market.Stock;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;


@Entity @Table(name = "bets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bet {
public enum Side { LONG, SHORT }
public enum Status { OPEN, SETTLED, CANCELLED }


@Id @Column(columnDefinition = "uuid")
private UUID id;


@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;


@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "symbol", referencedColumnName = "symbol", nullable = false)
private Stock stock;


@Enumerated(EnumType.STRING)
private Side side;


@Column(nullable = false)
private BigDecimal stake; // currency amount locked


@Column(nullable = false)
private BigDecimal entryPrice;


private BigDecimal targetPrice;
private BigDecimal stopPrice;


@Column(nullable = false)
private BigDecimal quantity; // computed from stake & entryPrice


@Enumerated(EnumType.STRING)
private Status status = Status.OPEN;


private Instant openedAt = Instant.now();
private Instant settledAt;
}