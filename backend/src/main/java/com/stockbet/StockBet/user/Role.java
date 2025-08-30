package com.stockbet.user;


import jakarta.persistence.*;
import lombok.*;


@Entity @Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;
@Column(unique = true, nullable = false)
private String name; // e.g., ROLE_USER
}