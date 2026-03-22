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
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return sendJson(res, 200, {
          balance: 10000,
          in_bets: 0,
          user_id: user.id,
        });
      }
      return sendJson(res, 200, data);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const action = body.action as string;
      const amount = Number(body.amount);

      if (action === 'deposit') {
        if (!(amount >= 100 && amount <= 1_000_000)) {
          return sendJson(res, 400, { error: 'Amount must be between 100 and 1,000,000' });
        }
        const { error } = await supabase.rpc('deposit_funds', { p_amount: amount });
        if (error) throw error;
        return sendJson(res, 200, { ok: true });
      }

      if (action === 'withdraw') {
        if (!(amount >= 100)) {
          return sendJson(res, 400, { error: 'Amount must be at least 100' });
        }
        const { error } = await supabase.rpc('withdraw_funds', { p_amount: amount });
        if (error) throw error;
        return sendJson(res, 200, { ok: true });
      }

      return sendJson(res, 400, { error: 'Unknown action. Use deposit or withdraw.' });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
