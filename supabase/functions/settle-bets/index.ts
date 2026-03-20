import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get all expired bets
    const { data: expiredBets, error: fetchErr } = await supabase.rpc('get_expired_bets');

    if (fetchErr) {
      console.error('Error fetching expired bets:', fetchErr);
      throw fetchErr;
    }

    if (!expiredBets || expiredBets.length === 0) {
      return new Response(JSON.stringify({ settled: 0, message: 'No expired bets' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${expiredBets.length} expired bets to settle`);

    // 2. Get unique symbols and fetch current prices
    const symbolsByMarket: Record<string, string[]> = {};
    for (const bet of expiredBets) {
      if (!symbolsByMarket[bet.market]) symbolsByMarket[bet.market] = [];
      if (!symbolsByMarket[bet.market].includes(bet.symbol)) {
        symbolsByMarket[bet.market].push(bet.symbol);
      }
    }

    // Fetch prices from our own market-data function
    const priceMap: Record<string, number> = {};

    for (const [market, symbols] of Object.entries(symbolsByMarket)) {
      const marketDataUrl = `${supabaseUrl}/functions/v1/market-data`;
      const res = await fetch(marketDataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ symbols, market }),
      });

      if (res.ok) {
        const data = await res.json();
        for (const stock of (data.stocks || [])) {
          priceMap[stock.symbol] = stock.price;
        }
      } else {
        console.error(`Failed to fetch prices for market ${market}:`, await res.text());
      }
    }

    // 3. Settle each bet
    let settled = 0;
    const results: Array<{ betId: string; symbol: string; status: string }> = [];

    for (const bet of expiredBets) {
      const exitPrice = priceMap[bet.symbol];
      if (!exitPrice) {
        console.warn(`No price found for ${bet.symbol}, skipping bet ${bet.id}`);
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'skipped_no_price' });
        continue;
      }

      const { error: settleErr } = await supabase.rpc('settle_bet', {
        p_bet_id: bet.id,
        p_exit_price: exitPrice,
      });

      if (settleErr) {
        console.error(`Failed to settle bet ${bet.id}:`, settleErr);
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'error' });
      } else {
        settled++;
        results.push({ betId: bet.id, symbol: bet.symbol, status: 'settled' });
      }
    }

    console.log(`Settlement complete: ${settled}/${expiredBets.length} bets settled`);

    return new Response(JSON.stringify({ settled, total: expiredBets.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Settlement engine error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
