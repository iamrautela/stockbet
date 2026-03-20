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
  const { data, error } = await supabase.rpc('place_bet', {
    p_symbol: params.symbol,
    p_stock_name: params.stockName,
    p_market: params.market,
    p_bet_type: params.betType,
    p_stake: params.stake,
    p_entry_price: params.entryPrice,
    p_expiry: params.expiry,
  });

  if (error) throw new Error(error.message);
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
