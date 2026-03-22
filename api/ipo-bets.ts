import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';
import { createUserClient } from '../lib/server/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const ipo_id = String(body.ipo_id || '');
    const prediction = String(body.prediction || '');
    const stake = Number(body.stake);

    if (!ipo_id || !prediction || !stake || stake <= 0) {
      return sendJson(res, 400, { error: 'ipo_id, prediction, and stake are required' });
    }

    const { data, error } = await supabase
      .from('ipo_bets')
      .insert({
        user_id: user.id,
        ipo_id,
        prediction,
        stake,
      })
      .select('id')
      .single();

    if (error) throw error;
    return sendJson(res, 201, { id: data.id });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
