-- Function to settle a single bet given exit price
CREATE OR REPLACE FUNCTION public.settle_bet(p_bet_id UUID, p_exit_price NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_bet RECORD;
  v_pnl NUMERIC;
  v_pnl_percent NUMERIC;
  v_status TEXT;
  v_payout NUMERIC;
BEGIN
  SELECT * INTO v_bet FROM public.bets WHERE id = p_bet_id AND status = 'open' FOR UPDATE;
  
  IF v_bet IS NULL THEN
    RETURN;
  END IF;

  IF v_bet.bet_type = 'long' THEN
    v_pnl_percent := ((p_exit_price - v_bet.entry_price) / v_bet.entry_price) * 100;
  ELSE
    v_pnl_percent := ((v_bet.entry_price - p_exit_price) / v_bet.entry_price) * 100;
  END IF;

  v_pnl := (v_pnl_percent / 100) * v_bet.stake;

  IF v_pnl > 0 THEN
    v_status := 'won';
    v_payout := v_bet.stake + v_pnl;
  ELSE
    v_status := 'lost';
    v_payout := GREATEST(v_bet.stake + v_pnl, 0);
  END IF;

  UPDATE public.bets 
  SET status = v_status,
      exit_price = p_exit_price,
      current_price = p_exit_price,
      pnl = ROUND(v_pnl, 2),
      pnl_percent = ROUND(v_pnl_percent, 2),
      settled_at = now()
  WHERE id = p_bet_id;

  UPDATE public.wallets
  SET balance = balance + v_payout,
      in_bets = in_bets - v_bet.stake
  WHERE user_id = v_bet.user_id;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description, bet_id)
  VALUES (
    v_bet.user_id,
    'payout',
    ROUND(v_payout, 2),
    v_status || ' ' || v_bet.bet_type || ' ' || v_bet.symbol || ' (' || 
      CASE WHEN v_pnl >= 0 THEN '+' ELSE '' END || ROUND(v_pnl, 2)::TEXT || ')',
    p_bet_id
  );
END;
$$;

-- Function to get expired bet IDs
CREATE OR REPLACE FUNCTION public.get_expired_bets()
RETURNS TABLE(id UUID, symbol TEXT, market TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT b.id, b.symbol, b.market
  FROM public.bets b
  WHERE b.status = 'open'
    AND (
      (b.expiry = '15m' AND b.created_at + interval '15 minutes' <= now()) OR
      (b.expiry = '1h' AND b.created_at + interval '1 hour' <= now()) OR
      (b.expiry = '4h' AND b.created_at + interval '4 hours' <= now()) OR
      (b.expiry = 'EOD' AND b.created_at + interval '16 hours' <= now())
    );
$$;