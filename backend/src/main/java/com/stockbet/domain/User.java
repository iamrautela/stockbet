package com.stockbet.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    private UUID id = UUID.randomUUID();
    @Column(nullable = false, unique = true)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private String role = "USER";
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // getters and setters
    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public String getEmail(){return email;}
    public void setEmail(String email){this.email=email;}
    public String getPasswordHash(){return passwordHash;}
    public void setPasswordHash(String ph){this.passwordHash=ph;}
    public String getRole(){return role;}
    public void setRole(String role){this.role=role;}
    public Instant getCreatedAt(){return createdAt;}
    public void setCreatedAt(Instant t){this.createdAt=t;}
}
