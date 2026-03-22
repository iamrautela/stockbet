import { supabase } from '@/integrations/supabase/client';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';

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
  if (backendApiEnabled()) {
    const res = await apiFetch<{ id: string }>('/api/bets', {
      method: 'POST',
      json: {
        symbol: params.symbol,
        stockName: params.stockName,
        market: params.market,
        betType: params.betType,
        stake: params.stake,
        entryPrice: params.entryPrice,
        expiry: params.expiry,
      },
    });
    return res.id;
  }

  const { data, error } = await supabase.rpc('place_bet', {
    p_symbol: params.symbol,
    p_stock_name: params.stockName,
    p_market: params.market,
    p_bet_type: params.betType,
    p_stake: params.stake,
    p_entry_price: params.entryPrice,
    p_expiry: params.expiry,
  });

  if (error) {
    if (error.message.includes('function') || error.message.includes('schema cache')) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: bet, error: betErr } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          symbol: params.symbol,
          stock_name: params.stockName,
          market: params.market,
          bet_type: params.betType,
          stake: params.stake,
          entry_price: params.entryPrice,
          expiry: params.expiry,
          status: 'open',
        })
        .select('id')
        .single();

      if (betErr) throw new Error(betErr.message);
      return bet.id;
    }
    throw new Error(error.message);
  }

  return data as string;
}

export async function getWallet() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (backendApiEnabled()) {
    const row = await apiFetch<{
      balance: number;
      in_bets: number;
      user_id: string;
      id?: string;
    }>('/api/wallet');
    return row;
  }

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) return { balance: 10000, in_bets: 0, user_id: user.id };
  return data;
}

export async function getOpenBets() {
  if (backendApiEnabled()) {
    const res = await apiFetch<{ bets: unknown[] }>('/api/bets?status=open');
    return res.bets || [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('status', 'open')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBetHistory() {
  if (backendApiEnabled()) {
    const res = await apiFetch<{ bets: unknown[] }>('/api/bets?status=history');
    return res.bets || [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .in('status', ['won', 'lost', 'settled'])
    .eq('user_id', user.id)
    .order('settled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWalletTransactions() {
  if (backendApiEnabled()) {
    const res = await apiFetch<{ transactions: unknown[] }>('/api/transactions');
    return res.transactions || [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
