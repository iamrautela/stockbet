import { supabase } from '@/integrations/supabase/client';

export interface PlaceBetParams {
  symbol: string;
  stockName: string;
  market: string;
  betType: 'long' | 'short';
  stake: number;
  entryPrice: number;
  expiry: string;
}

export async function placeBet(params: PlaceBetParams): Promise<string> {
  // Try the RPC first; if migration not run, fall back to direct insert
  const { data, error } = await supabase.rpc('place_bet_with_wallet', {
    p_symbol: params.symbol,
    p_stock_name: params.stockName,
    p_market: params.market,
    p_bet_type: params.betType,
    p_stake: params.stake,
    p_entry_price: params.entryPrice,
    p_expiry: params.expiry,
  });

  if (error) {
    // If RPC doesn't exist yet (migration not run), do a direct insert
    if (error.message.includes('function') || error.message.includes('schema cache')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const expiresAt = new Date();
      if (params.expiry === '15m') expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      else if (params.expiry === '1h') expiresAt.setHours(expiresAt.getHours() + 1);
      else if (params.expiry === '4h') expiresAt.setHours(expiresAt.getHours() + 4);
      else expiresAt.setHours(23, 59, 59, 0); // EOD

      const { data: bet, error: betErr } = await supabase.from('bets').insert({
        user_id: user.id,
        symbol: params.symbol,
        stock_name: params.stockName,
        market: params.market,
        bet_type: params.betType,
        stake: params.stake,
        entry_price: params.entryPrice,
        expiry: params.expiry,
        expires_at: expiresAt.toISOString(),
        status: 'open',
      }).select('id').single();

      if (betErr) throw new Error(betErr.message);
      return bet.id;
    }
    throw new Error(error.message);
  }

  return data as string;
}

export async function getWallet() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  // If no wallet row yet, return a default so UI shows something
  if (!data) return { balance: 10000, in_bets: 0, user_id: user.id };
  return data;
}

export async function getOpenBets() {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBetHistory() {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .in('status', ['won', 'lost', 'settled'])
    .order('settled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWalletTransactions() {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
