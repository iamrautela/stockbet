import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sendJson, handleOptions } from '../../lib/server/cors';
import { createUserClient } from '../../lib/server/supabase';
import { getRazorpayKeySecret } from '../../lib/server/env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const auth = req.headers.authorization;
  const supabase = createUserClient(auth);
  if (!supabase) return sendJson(res, 401, { error: 'Missing or invalid Authorization Bearer token' });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return sendJson(res, 401, { error: 'Invalid session' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
    return sendJson(res, 400, { error: 'Missing payment verification fields' });
  }

  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', getRazorpayKeySecret())
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return sendJson(res, 400, { error: 'Invalid payment signature' });
  }

  // Credit wallet via existing deposit_funds RPC
  const depositAmount = Number(amount) / 100; // convert paise to rupees
  const { error: rpcErr } = await supabase.rpc('deposit_funds', { p_amount: depositAmount });
  if (rpcErr) return sendJson(res, 500, { error: rpcErr.message });

  return sendJson(res, 200, { ok: true, credited: depositAmount });
}
