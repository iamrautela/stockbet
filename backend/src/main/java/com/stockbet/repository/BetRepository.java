package com.stockbet.repository;
import com.stockbet.domain.Bet;
import com.stockbet.domain.Market;
import com.stockbet.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface BetRepository extends JpaRepository<Bet, UUID> {
    List<Bet> findByMarket(Market m);
    List<Bet> findByUser(User u);
}
