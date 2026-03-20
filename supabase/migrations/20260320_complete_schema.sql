-- ============================================================================
-- STOCKBET COMPLETE DATABASE SCHEMA MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABLES (Create only if not exists)
-- ============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_market TEXT DEFAULT 'NSE',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IPOs table
CREATE TABLE IF NOT EXISTS public.ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  symbol TEXT,
  exchange TEXT,
  sector TEXT,
  listing_date DATE,
  price_band_low NUMERIC(12,2),
  price_band_high NUMERIC(12,2),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed', 'listed')),
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IPO Bets table
CREATE TABLE IF NOT EXISTS public.ipo_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ipo_id UUID REFERENCES public.ipos(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL,
  stake NUMERIC(12,2) NOT NULL CHECK (stake > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Strategies table
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rules_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Backtest Results table
CREATE TABLE IF NOT EXISTS public.backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
  win_rate NUMERIC(5,2),
  sharpe NUMERIC(8,4),
  max_drawdown NUMERIC(5,2),
  total_trades INT,
  returns NUMERIC(8,2),
  equity_curve_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watchlists policies
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlists;
CREATE POLICY "Users can view own watchlist" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlists;
CREATE POLICY "Users can insert own watchlist" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlists;
CREATE POLICY "Users can delete own watchlist" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- IPOs policies (all authenticated users can view, only admins can modify)
DROP POLICY IF EXISTS "Anyone can view IPOs" ON public.ipos;
CREATE POLICY "Anyone can view IPOs" ON public.ipos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert IPOs" ON public.ipos;
CREATE POLICY "Admins can insert IPOs" ON public.ipos FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update IPOs" ON public.ipos;
CREATE POLICY "Admins can update IPOs" ON public.ipos FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete IPOs" ON public.ipos;
CREATE POLICY "Admins can delete IPOs" ON public.ipos FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- IPO Bets policies
DROP POLICY IF EXISTS "Users can view own ipo bets" ON public.ipo_bets;
CREATE POLICY "Users can view own ipo bets" ON public.ipo_bets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ipo bets" ON public.ipo_bets;
CREATE POLICY "Users can insert own ipo bets" ON public.ipo_bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Strategies policies
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies;
CREATE POLICY "Users can view own strategies" ON public.strategies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own strategies" ON public.strategies;
CREATE POLICY "Users can insert own strategies" ON public.strategies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own strategies" ON public.strategies;
CREATE POLICY "Users can update own strategies" ON public.strategies FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own strategies" ON public.strategies;
CREATE POLICY "Users can delete own strategies" ON public.strategies FOR DELETE USING (auth.uid() = user_id);

-- Backtest Results policies
DROP POLICY IF EXISTS "Users can view own backtest results" ON public.backtest_results;
CREATE POLICY "Users can view own backtest results" ON public.backtest_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = backtest_results.strategy_id AND strategies.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own backtest results" ON public.backtest_results;
CREATE POLICY "Users can insert own backtest results" ON public.backtest_results FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.strategies WHERE strategies.id = backtest_results.strategy_id AND strategies.user_id = auth.uid()));

-- User Roles policies
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Audit Logs policies (admin only)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

-- Deposit funds function
CREATE OR REPLACE FUNCTION public.deposit_funds(p_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_amount <= 0 OR p_amount > 1000000 THEN
    RAISE EXCEPTION 'Invalid amount. Must be between 1 and 1,000,000';
  END IF;

  -- Update wallet balance
  UPDATE public.wallets 
  SET balance = balance + p_amount 
  WHERE user_id = v_user_id;

  -- Record transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (v_user_id, 'deposit', p_amount, 'Deposit', 'completed');
END;
$$;

-- Withdraw funds function
CREATE OR REPLACE FUNCTION public.withdraw_funds(p_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount. Must be greater than 0';
  END IF;

  -- Get current balance with lock
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', v_balance, p_amount;
  END IF;

  -- Deduct from wallet
  UPDATE public.wallets 
  SET balance = balance - p_amount 
  WHERE user_id = v_user_id;

  -- Record transaction as pending
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, status)
  VALUES (v_user_id, 'withdrawal', -p_amount, 'Withdrawal request', 'pending');
END;
$$;

-- Check if user has role
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  SELECT role INTO v_user_role FROM public.user_roles WHERE user_id = p_user_id;
  RETURN v_user_role = p_role;
END;
$$;

-- Place bet with wallet (alternative to existing place_bet)
CREATE OR REPLACE FUNCTION public.place_bet_with_wallet(
  p_symbol TEXT,
  p_market TEXT,
  p_direction TEXT,
  p_stake NUMERIC,
  p_entry_price NUMERIC,
  p_target_price NUMERIC
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

  -- Get current balance with lock
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;

  IF v_balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct from wallet
  UPDATE public.wallets 
  SET balance = balance - p_stake, 
      in_bets = in_bets + p_stake 
  WHERE user_id = v_user_id;

  -- Create bet
  INSERT INTO public.bets (user_id, symbol, stock_name, market, bet_type, stake, entry_price, expiry)
  VALUES (v_user_id, p_symbol, p_symbol, p_market, p_direction, p_stake, p_entry_price, '1h')
  RETURNING id INTO v_bet_id;

  -- Record transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, description, bet_id)
  VALUES (v_user_id, 'bet', -p_stake, p_direction || ' ' || p_symbol, v_bet_id);

  RETURN v_bet_id;
END;
$$;

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger: Auto-create profile, user_role, and wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- Create user role (default: user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create wallet with welcome bonus (if not exists from previous trigger)
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 10000.00)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Create notification when bet is settled
CREATE OR REPLACE FUNCTION public.notify_bet_settled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('won', 'lost') AND OLD.status = 'open' THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'won' THEN 'success' ELSE 'info' END,
      CASE WHEN NEW.status = 'won' THEN 'Bet Won! 🎉' ELSE 'Bet Settled' END,
      'Your ' || NEW.bet_type || ' bet on ' || NEW.symbol || ' has been settled. ' ||
      CASE WHEN NEW.pnl >= 0 THEN 'Profit: ₹' || ABS(NEW.pnl)::TEXT ELSE 'Loss: ₹' || ABS(NEW.pnl)::TEXT END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_bet_settled ON public.bets;
CREATE TRIGGER on_bet_settled
AFTER UPDATE ON public.bets
FOR EACH ROW EXECUTE FUNCTION public.notify_bet_settled();

-- Trigger: Audit log for bets
CREATE OR REPLACE FUNCTION public.audit_bets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
    VALUES (NEW.user_id, 'CREATE', 'bet', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
    VALUES (NEW.user_id, 'UPDATE', 'bet', NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_bets_trigger ON public.bets;
CREATE TRIGGER audit_bets_trigger
AFTER INSERT OR UPDATE ON public.bets
FOR EACH ROW EXECUTE FUNCTION public.audit_bets();

-- Trigger: Audit log for wallet transactions
CREATE OR REPLACE FUNCTION public.audit_wallet_transactions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
  VALUES (NEW.user_id, 'CREATE', 'wallet_transaction', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_wallet_transactions_trigger ON public.wallet_transactions;
CREATE TRIGGER audit_wallet_transactions_trigger
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.audit_wallet_transactions();

-- Trigger: Audit log for IPOs
CREATE OR REPLACE FUNCTION public.audit_ipos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
    VALUES (auth.uid(), 'CREATE', 'ipo', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
    VALUES (auth.uid(), 'UPDATE', 'ipo', NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_ipos_trigger ON public.ipos;
CREATE TRIGGER audit_ipos_trigger
AFTER INSERT OR UPDATE ON public.ipos
FOR EACH ROW EXECUTE FUNCTION public.audit_ipos();

-- ============================================================================
-- 5. REALTIME
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- 6. SEED DATA - Sample IPOs
-- ============================================================================

INSERT INTO public.ipos (company, symbol, exchange, sector, listing_date, price_band_low, price_band_high, status, sentiment)
VALUES 
  ('Tata Technologies', 'TATATECH.NS', 'NSE', 'Technology', '2024-11-30', 475, 500, 'listed', 'positive'),
  ('Ola Electric', 'OLAELEC.NS', 'NSE', 'Automotive', '2024-08-09', 72, 76, 'listed', 'neutral'),
  ('Awfis Space Solutions', 'AWFIS.NS', 'NSE', 'Real Estate', '2024-05-30', 299, 315, 'listed', 'positive'),
  ('Bharti Hexacom', 'BHARTIHEXA.NS', 'NSE', 'Telecom', '2024-04-12', 570, 600, 'listed', 'positive'),
  ('NextGen Innovations', 'NEXTGEN.NS', 'NSE', 'Technology', '2024-04-25', 850, 900, 'upcoming', 'positive')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
