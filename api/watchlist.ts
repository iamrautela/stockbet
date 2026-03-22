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
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { watchlist: data || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const symbol = String(body.symbol || '');
      const market = String(body.market || 'US');
      if (!symbol) return sendJson(res, 400, { error: 'symbol required' });

      const { data, error } = await supabase
        .from('watchlists')
        .insert({ user_id: user.id, symbol, market })
        .select('*')
        .single();
      if (error) throw error;
      return sendJson(res, 201, { item: data });
    }

    if (req.method === 'DELETE') {
      const symbol = String(req.query.symbol || '');
      const market = String(req.query.market || 'US');
      if (!symbol) return sendJson(res, 400, { error: 'symbol query required' });

      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .eq('market', market);
      if (error) throw error;
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
