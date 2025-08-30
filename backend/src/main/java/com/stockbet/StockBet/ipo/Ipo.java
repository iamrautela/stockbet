package com.stockbet.ipo;


import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;


@Entity @Table(name = "ipos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ipo {
@Id @Column(columnDefinition = "uuid")
private UUID id;
private String symbol;
private String name;
private LocalDate listingDate;
private BigDecimal price;
private String exchange;
}