package com.stockbet.repository;
import com.stockbet.domain.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface MarketRepository extends JpaRepository<Market, UUID> { }
