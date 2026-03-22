import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';
import { createUserClient } from '../lib/server/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);

  const auth = req.headers.authorization;
  const supabase = createUserClient(auth);
  if (!supabase) {
    return sendJson(res, 401, { error: 'Missing or invalid Authorization Bearer token' });
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return sendJson(res, 401, { error: 'Invalid session' });
  }

  try {
    if (req.method === 'GET') {
      const status = (req.query.status as string) || 'open';
      if (status === 'open') {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('status', 'open')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return sendJson(res, 200, { bets: data || [] });
      }
      if (status === 'history') {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .in('status', ['won', 'lost', 'settled'])
          .eq('user_id', user.id)
          .order('settled_at', { ascending: false });
        if (error) throw error;
        return sendJson(res, 200, { bets: data || [] });
      }
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { bets: data || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const symbol = String(body.symbol || '');
      const stockName = String(body.stockName || body.stock_name || symbol);
      const market = String(body.market || 'US');
      const betType = String(body.betType || body.bet_type || 'long');
      const stake = Number(body.stake);
      const entryPrice = Number(body.entryPrice ?? body.entry_price);
      const expiry = String(body.expiry || '1h');

      if (!symbol || !stake || stake <= 0 || !entryPrice || entryPrice <= 0) {
        return sendJson(res, 400, { error: 'symbol, stake, and entryPrice are required' });
      }
      if (betType !== 'long' && betType !== 'short') {
        return sendJson(res, 400, { error: 'betType must be long or short' });
      }

      const { data: betId, error } = await supabase.rpc('place_bet', {
        p_symbol: symbol,
        p_stock_name: stockName,
        p_market: market,
        p_bet_type: betType,
        p_stake: stake,
        p_entry_price: entryPrice,
        p_expiry: expiry,
      });

      if (error) throw error;
      return sendJson(res, 201, { id: betId });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
