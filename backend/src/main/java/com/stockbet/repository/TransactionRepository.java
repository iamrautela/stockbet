package com.stockbet.repository;
import com.stockbet.domain.Transaction;
import com.stockbet.domain.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByWallet(Wallet w);
}
