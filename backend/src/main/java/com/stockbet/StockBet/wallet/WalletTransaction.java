package com.stockbet.wallet;


import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;


@Entity @Table(name = "wallet_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletTransaction {
public enum Type { DEPOSIT, WITHDRAW, BET_OPEN, BET_SETTLE, REFUND }


@Id @Column(columnDefinition = "uuid")
private UUID id;


@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "wallet_id", nullable = false)
private Wallet wallet;


@Enumerated(EnumType.STRING)
private Type type;


@Column(nullable = false)
private BigDecimal amount;


@Column(nullable = false)
private BigDecimal balanceAfter;


private UUID refId; // bet id etc.


private Instant createdAt = Instant.now();
}