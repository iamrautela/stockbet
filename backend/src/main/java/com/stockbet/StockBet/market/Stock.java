package com.stockbet.market;


import jakarta.persistence.*;
import lombok.*;


@Entity @Table(name = "stocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stock {
@Id
@Column(length = 16)
private String symbol; // e.g., AAPL.NS for NSE


@Column(nullable = false)
private String name;


@Column(nullable = false)
private String exchange; // NSE, BSE, NASDAQ etc
}