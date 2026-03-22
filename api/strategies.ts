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
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return sendJson(res, 200, { strategies: data || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const name = String(body.name || 'Untitled');
      const rules_json = body.rules_json ?? null;
      const { data, error } = await supabase
        .from('strategies')
        .insert({ user_id: user.id, name, rules_json })
        .select('*')
        .single();
      if (error) throw error;
      return sendJson(res, 201, { strategy: data });
    }

    if (req.method === 'PATCH') {
      const id = String(req.query.id || '');
      if (!id) return sendJson(res, 400, { error: 'id query required' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.rules_json !== undefined) patch.rules_json = body.rules_json;

      const { data, error } = await supabase
        .from('strategies')
        .update(patch)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      return sendJson(res, 200, { strategy: data });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id || '');
      if (!id) return sendJson(res, 400, { error: 'id query required' });
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return sendJson(res, 400, { error: (e as Error).message });
  }
}
