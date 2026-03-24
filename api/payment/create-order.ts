import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { sendJson, handleOptions } from '../../lib/server/cors';
import { createUserClient } from '../../lib/server/supabase';
import { getRazorpayKeyId, getRazorpayKeySecret } from '../../lib/server/env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const auth = req.headers.authorization;
  const supabase = createUserClient(auth);
  if (!supabase) return sendJson(res, 401, { error: 'Missing or invalid Authorization Bearer token' });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return sendJson(res, 401, { error: 'Invalid session' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const amount = Number(body.amount);

  if (!amount || amount < 100 || amount > 1_000_000) {
    return sendJson(res, 400, { error: 'Amount must be between ₹100 and ₹10,00,000' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `wallet_${user.id}_${Date.now()}`,
      notes: { user_id: user.id },
    });

    return sendJson(res, 200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
    });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}
