CREATE TABLE roles (
);


CREATE TYPE txn_type AS ENUM ('DEPOSIT','WITHDRAW','BET_OPEN','BET_SETTLE','REFUND');


CREATE TABLE wallet_transactions (
id UUID PRIMARY KEY,
wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
type txn_type NOT NULL,
amount NUMERIC(18,2) NOT NULL,
balance_after NUMERIC(18,2) NOT NULL,
ref_id UUID,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE ipos (
id UUID PRIMARY KEY,
symbol VARCHAR(16) NOT NULL,
name VARCHAR(255) NOT NULL,
listing_date DATE NOT NULL,
price NUMERIC(18,2) NOT NULL,
exchange VARCHAR(32) NOT NULL
);


INSERT INTO roles(name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');


# ─────────────────────────────────────────────────────────────────────────────
# File: src/main/java/com/stockbet/StockbetApplication.java
package com.stockbet;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class StockbetApplication {
public static void main(String[] args) {
SpringApplication.run(StockbetApplication.class, args);
}
}