package com.stockbet.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="markets")
public class Market {
    public enum Status { OPEN, CLOSED, RESOLVED }
    public enum Outcome { UP, DOWN, NA }

    @Id
    private UUID id = UUID.randomUUID();

    @Column(nullable=false)
    private String symbol;
    @Column(nullable=false)
    private String title;
    private String description;

    @Column(name="resolve_by", nullable=false)
    private Instant resolveBy;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @Enumerated(EnumType.STRING)
    private Outcome resolution;

    @Column(name="created_at", nullable=false)
    private Instant createdAt = Instant.now();

    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public String getSymbol(){return symbol;}
    public void setSymbol(String s){this.symbol=s;}
    public String getTitle(){return title;}
    public void setTitle(String t){this.title=t;}
    public String getDescription(){return description;}
    public void setDescription(String d){this.description=d;}
    public Instant getResolveBy(){return resolveBy;}
    public void setResolveBy(Instant r){this.resolveBy=r;}
    public Status getStatus(){return status;}
    public void setStatus(Status s){this.status=s;}
    public Outcome getResolution(){return resolution;}
    public void setResolution(Outcome o){this.resolution=o;}
    public Instant getCreatedAt(){return createdAt;}
    public void setCreatedAt(Instant c){this.createdAt=c;}
}
