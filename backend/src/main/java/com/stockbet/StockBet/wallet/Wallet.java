package com.stockbet.wallet;


import com.stockbet.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;


@Entity @Table(name = "wallets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Wallet {
@Id @Column(columnDefinition = "uuid")
private UUID id;


@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false, unique = true)
private User user;


@Column(nullable = false)
private BigDecimal balance = BigDecimal.ZERO;


@Column(nullable = false)
private String currency = "INR";
}