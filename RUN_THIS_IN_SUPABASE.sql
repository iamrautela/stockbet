-- ============================================================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- ============================================================================
-- 1. Go to: https://briqyyahuhtraxofnrfi.supabase.co
-- 2. Click "SQL Editor" in left sidebar
-- 3. Click "New Query"
-- 4. Paste this entire file and click RUN
-- ============================================================================

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_market TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ── User roles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ── Wallets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) DEFAULT 10000.00,
  in_bets NUMERIC(18,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallets_select" ON public.wallets;
CREATE POLICY "wallets_select" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallets_insert" ON public.wallets;
CREATE POLICY "wallets_insert" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallets_update" ON public.wallets;
CREATE POLICY "wallets_update" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- ── Wallet transactions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','bet','payout')),
  amount NUMERIC(18,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed','pending','failed')),
  bet_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wtx_select" ON public.wallet_transactions;
CREATE POLICY "wtx_select" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wtx_insert" ON public.wallet_transactions;
CREATE POLICY "wtx_insert" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Bets ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  market TEXT DEFAULT 'US',
  bet_type TEXT NOT NULL CHECK (bet_type IN ('long','short')),
  stake NUMERIC(18,2) NOT NULL,
  entry_price NUMERIC(18,4) NOT NULL,
  exit_price NUMERIC(18,4),
  current_price NUMERIC(18,4),
  expiry TEXT DEFAULT '1h',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','won','lost','settled')),
  pnl NUMERIC(18,2),
  pnl_percent NUMERIC(10,4),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bets_select" ON public.bets;
CREATE POLICY "bets_select" ON public.bets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "bets_insert" ON public.bets;
CREATE POLICY "bets_insert" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "bets_update" ON public.bets;
CREATE POLICY "bets_update" ON public.bets FOR UPDATE USING (auth.uid() = user_id);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select" ON public.notifications;
CREATE POLICY "notif_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_insert" ON public.notifications;
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_update" ON public.notifications;
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── deposit_funds RPC ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deposit_funds(p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, in_bets)
    VALUES (auth.uid(), p_amount, 0)
    ON CONFLICT (user_id)
    DO UPDATE SET balance = wallets.balance + p_amount, updated_at = now();

  INSERT INTO public.wallet_transactions (user_id, type, amount, status, description)
    VALUES (auth.uid(), 'deposit', p_amount, 'completed', 'Deposit');
END;
$$;

-- ── withdraw_funds RPC ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.withdraw_funds(p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT balance FROM public.wallets WHERE user_id = auth.uid()) < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.wallets SET balance = balance - p_amount, updated_at = now()
    WHERE user_id = auth.uid();

  INSERT INTO public.wallet_transactions (user_id, type, amount, status, description)
    VALUES (auth.uid(), 'withdrawal', -p_amount, 'completed', 'Withdrawal');
END;
$$;

-- ── place_bet RPC ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.place_bet(
  p_symbol TEXT, p_stock_name TEXT, p_market TEXT,
  p_bet_type TEXT, p_stake NUMERIC, p_entry_price NUMERIC, p_expiry TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_bet_id UUID;
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = auth.uid();
  IF v_balance IS NULL OR v_balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct stake and add to in_bets
  UPDATE public.wallets
    SET balance = balance - p_stake, in_bets = in_bets + p_stake, updated_at = now()
    WHERE user_id = auth.uid();

  -- Create bet
  INSERT INTO public.bets (user_id, symbol, stock_name, market, bet_type, stake, entry_price, expiry)
    VALUES (auth.uid(), p_symbol, p_stock_name, p_market, p_bet_type, p_stake, p_entry_price, p_expiry)
    RETURNING id INTO v_bet_id;

  -- Log transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, status, bet_id, description)
    VALUES (auth.uid(), 'bet', -p_stake, 'completed', v_bet_id, 'Bet on ' || p_symbol);

  RETURN v_bet_id;
END;
$$;

-- ── settle_bet RPC ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.settle_bet(p_bet_id UUID, p_exit_price NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_bet public.bets%ROWTYPE;
  v_pnl_pct NUMERIC;
  v_pnl NUMERIC;
  v_payout NUMERIC;
  v_status TEXT;
BEGIN
  SELECT * INTO v_bet FROM public.bets WHERE id = p_bet_id AND status = 'open';
  IF NOT FOUND THEN RETURN; END IF;

  IF v_bet.bet_type = 'long' THEN
    v_pnl_pct := (p_exit_price - v_bet.entry_price) / v_bet.entry_price;
  ELSE
    v_pnl_pct := (v_bet.entry_price - p_exit_price) / v_bet.entry_price;
  END IF;

  v_pnl := v_bet.stake * v_pnl_pct;
  v_payout := v_bet.stake + v_pnl;
  v_status := CASE WHEN v_pnl >= 0 THEN 'won' ELSE 'lost' END;

  UPDATE public.bets SET
    status = v_status, exit_price = p_exit_price,
    pnl = v_pnl, pnl_percent = v_pnl_pct * 100,
    settled_at = now(), updated_at = now()
    WHERE id = p_bet_id;

  -- Return stake + pnl to wallet, remove from in_bets
  UPDATE public.wallets SET
    balance = balance + GREATEST(v_payout, 0),
    in_bets = GREATEST(in_bets - v_bet.stake, 0),
    updated_at = now()
    WHERE user_id = v_bet.user_id;

  -- Log payout
  INSERT INTO public.wallet_transactions (user_id, type, amount, status, bet_id, description)
    VALUES (v_bet.user_id, 'payout', GREATEST(v_payout, 0), 'completed', p_bet_id,
            v_status || ' ' || v_bet.bet_type || ' ' || v_bet.symbol);
END;
$$;

-- ── get_expired_bets RPC ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_expired_bets()
RETURNS TABLE(id UUID, symbol TEXT, market TEXT, user_id UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.symbol, b.market, b.user_id FROM public.bets b
  WHERE b.status = 'open'
    AND b.created_at < now() - CASE b.expiry
      WHEN '15m' THEN INTERVAL '15 minutes'
      WHEN '1h'  THEN INTERVAL '1 hour'
      WHEN '4h'  THEN INTERVAL '4 hours'
      WHEN 'EOD' THEN INTERVAL '1 day'
      ELSE INTERVAL '1 hour'
    END;
END;
$$;

-- ── New user trigger ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 10000.00)
    ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Backfill wallets for existing users ───────────────────────────────────────
INSERT INTO public.wallets (user_id, balance)
  SELECT id, 10000.00 FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;

DO $$ BEGIN RAISE NOTICE 'Setup complete!'; END $$;
