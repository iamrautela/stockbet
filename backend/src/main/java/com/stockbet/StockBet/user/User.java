package com.stockbet.user;


import com.stockbet.wallet.Wallet;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;
import java.util.UUID;


@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
@Id
@Column(columnDefinition = "uuid")
private UUID id;


@Column(unique = true, nullable = false)
private String email;


@Column(nullable = false)
private String password;


@Column(nullable = false)
private String displayName;


@Column(nullable = false)
private boolean enabled = true;


@ManyToMany(fetch = FetchType.EAGER)
@JoinTable(
name = "user_roles",
joinColumns = @JoinColumn(name = "user_id"),
inverseJoinColumns = @JoinColumn(name = "role_id")
)
private Set<Role> roles = new HashSet<>();


@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
private Wallet wallet;
}