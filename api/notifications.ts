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
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return sendJson(res, 200, { notifications: data || [] });
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

      if (body.markAllRead) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
        if (error) throw error;
        return sendJson(res, 200, { ok: true });
      }

      const id = body.id as string | undefined;
      if (id) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: body.read !== false })
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return sendJson(res, 200, { ok: true });
      }

      return sendJson(res, 400, { error: 'Provide id or markAllRead' });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
