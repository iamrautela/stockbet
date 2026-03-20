
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
  in_bets NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0),
  CONSTRAINT in_bets_non_negative CHECK (in_bets >= 0)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bets table
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'US',
  bet_type TEXT NOT NULL CHECK (bet_type IN ('long', 'short')),
  stake NUMERIC(12,2) NOT NULL CHECK (stake > 0),
  entry_price NUMERIC(14,4) NOT NULL,
  current_price NUMERIC(14,4),
  exit_price NUMERIC(14,4),
  pnl NUMERIC(12,4),
  pnl_percent NUMERIC(8,4),
  expiry TEXT NOT NULL DEFAULT '1h',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'settled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'payout')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  bet_id UUID REFERENCES public.bets(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to place a bet (handles balance check + lock atomically)
CREATE OR REPLACE FUNCTION public.place_bet(
  p_symbol TEXT,
  p_stock_name TEXT,
  p_market TEXT,
  p_bet_type TEXT,
  p_stake NUMERIC,
  p_entry_price NUMERIC,
  p_expiry TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_bet_id UUID;
  v_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current balance with row lock
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;
  
  IF v_balance IS NULL THEN
    -- Auto-create wallet with default balance
    INSERT INTO public.wallets (user_id) VALUES (v_user_id) RETURNING balance INTO v_balance;
  END IF;

  IF v_balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_balance, p_stake;
  END IF;

  -- Deduct from wallet
  UPDATE public.wallets SET balance = balance - p_stake, in_bets = in_bets + p_stake WHERE user_id = v_user_id;

  -- Create bet
  INSERT INTO public.bets (user_id, symbol, stock_name, market, bet_type, stake, entry_price, expiry)
  VALUES (v_user_id, p_symbol, p_stock_name, p_market, p_bet_type, p_stake, p_entry_price, p_expiry)
  RETURNING id INTO v_bet_id;

  -- Record transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, bet_id)
  VALUES (v_user_id, 'bet', -p_stake, p_bet_type || ' ' || p_symbol, v_bet_id);

  RETURN v_bet_id;
END;
$$;

-- Auto-create wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_wallet
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
