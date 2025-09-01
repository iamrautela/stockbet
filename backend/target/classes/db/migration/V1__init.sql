-- V1__init.sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(18,2) NOT NULL DEFAULT 0
);

CREATE TYPE market_status AS ENUM ('OPEN', 'CLOSED', 'RESOLVED');
CREATE TYPE outcome AS ENUM ('UP', 'DOWN', 'NA');

CREATE TABLE markets (
    id UUID PRIMARY KEY,
    symbol TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    resolve_by TIMESTAMPTZ NOT NULL,
    status market_status NOT NULL DEFAULT 'OPEN',
    resolution outcome,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE bet_status AS ENUM ('PENDING', 'WON', 'LOST', 'REFUNDED');

CREATE TABLE bets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    outcome outcome NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status bet_status NOT NULL DEFAULT 'PENDING',
    payout NUMERIC(18,2)
);

CREATE TYPE tx_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET_WAGER', 'BET_PAYOUT', 'REFUND');

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type tx_type NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed admin
INSERT INTO users(id, email, password_hash, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@stockbet.local', '$2a$10$1x9T6T0qv3y4z6jZQG3mQe4wOe2QG5p3XyUjH6I0Y0l2QhTg4q1xK', 'ADMIN'); -- password: admin123

INSERT INTO wallets(id, user_id, balance) VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 0);
