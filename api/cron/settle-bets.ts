import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../../lib/server/cors';
import { getCronSecret } from '../../lib/server/env';
import { createServiceClient } from '../../lib/server/supabase';
import { fetchYahooQuotes } from '../../lib/server/market';

function authorizeCron(req: VercelRequest): boolean {
  const secret = getCronSecret();
  if (!secret) return true;
  const auth = req.headers.authorization;
  const headerSecret = req.headers['x-cron-secret'] as string | undefined;
  if (auth === `Bearer ${secret}`) return true;
  if (headerSecret === secret) return true;
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!authorizeCron(req)) {
    return sendJson(res, 401, { error: 'Unauthorized' });
  }

  try {
    const supabase = createServiceClient();

    const { data: expiredBets, error: fetchErr } = await supabase.rpc('get_expired_bets');
    if (fetchErr) throw fetchErr;

    if (!expiredBets || expiredBets.length === 0) {
      return sendJson(res, 200, { settled: 0, total: 0, message: 'No expired bets' });
    }

    const symbolsByMarket: Record<string, string[]> = {};
    for (const bet of expiredBets as { id: string; symbol: string; market: string }[]) {
      if (!symbolsByMarket[bet.market]) symbolsByMarket[bet.market] = [];
      if (!symbolsByMarket[bet.market].includes(bet.symbol)) {
        symbolsByMarket[bet.market].push(bet.symbol);
      }
    }

    const priceMap: Record<string, number> = {};
    for (const [market, symbols] of Object.entries(symbolsByMarket)) {
      const { stocks } = await fetchYahooQuotes(symbols, market);
      for (const s of stocks) {
        priceMap[s.symbol] = s.price;
      }
    }

    let settled = 0;
    const results: Array<{ betId: string; symbol: string; status: string }> = [];

    for (const bet of expiredBets as { id: string; symbol: string; market: string }[]) {
      const exitPrice = priceMap[bet.symbol];
      if (!exitPrice) {
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'skipped_no_price' });
        continue;
      }

      const { error: settleErr } = await supabase.rpc('settle_bet', {
        p_bet_id: bet.id,
        p_exit_price: exitPrice,
      });

      if (settleErr) {
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'error' });
      } else {
        settled++;
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'settled' });
      }
    }

    return sendJson(res, 200, {
      settled,
      total: expiredBets.length,
      results,
    });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}
