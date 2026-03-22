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
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return sendJson(res, 200, { profile: data });
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { display_name, avatar_url, preferred_market } = body;
      const patch: Record<string, unknown> = { user_id: user.id };
      if (display_name !== undefined) patch.display_name = display_name;
      if (avatar_url !== undefined) patch.avatar_url = avatar_url;
      if (preferred_market !== undefined) patch.preferred_market = preferred_market;

      const { error } = await supabase.from('profiles').upsert(patch);
      if (error) throw error;

      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (fetchErr) throw fetchErr;
      return sendJson(res, 200, { profile: data });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
