import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbols, market } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(JSON.stringify({ error: 'symbols array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const limitedSymbols = symbols.slice(0, 20);
    const symbolsParam = limitedSymbols.join(',');

    // Try Yahoo Finance v8 quote endpoint
    const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolsParam)}`;

    let stocks: any[] = [];
    let source = 'simulated';

    try {
      const response = await fetch(quoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const quotes = data?.quoteResponse?.result || [];

        if (quotes.length > 0) {
          stocks = quotes.map((q: any) => ({
            symbol: q.symbol,
            name: q.shortName || q.longName || q.symbol,
            price: q.regularMarketPrice || 0,
            change: q.regularMarketChange || 0,
            changePercent: q.regularMarketChangePercent || 0,
            volume: formatVolume(q.regularMarketVolume || 0),
            marketCap: formatMarketCap(q.marketCap || 0),
            dayHigh: q.regularMarketDayHigh || 0,
            dayLow: q.regularMarketDayLow || 0,
            open: q.regularMarketOpen || 0,
            previousClose: q.regularMarketPreviousClose || 0,
            market: market || 'US',
            sector: q.sector || 'Unknown',
            currency: q.currency || 'USD',
          }));
          source = 'yahoo';
        }
      }
    } catch (fetchErr) {
      console.log('Yahoo Finance fetch failed, using simulated data:', fetchErr);
    }

    // Fallback to simulated data
    if (stocks.length === 0) {
      stocks = generateSimulatedData(limitedSymbols, market);
    }

    return new Response(JSON.stringify({ stocks, source }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Market data error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toString();
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return (cap / 1e12).toFixed(2) + 'T';
  if (cap >= 1e9) return (cap / 1e9).toFixed(1) + 'B';
  if (cap >= 1e6) return (cap / 1e6).toFixed(1) + 'M';
  return cap.toString();
}

function generateSimulatedData(symbols: string[], market: string) {
  const basePrices: Record<string, { price: number; name: string; sector: string }> = {
    'AAPL': { price: 198.45, name: 'Apple Inc.', sector: 'Technology' },
    'TSLA': { price: 248.92, name: 'Tesla Inc.', sector: 'Automotive' },
    'NVDA': { price: 875.30, name: 'NVIDIA Corp.', sector: 'Technology' },
    'MSFT': { price: 415.60, name: 'Microsoft Corp.', sector: 'Technology' },
    'AMZN': { price: 185.20, name: 'Amazon.com Inc.', sector: 'Consumer' },
    'GOOGL': { price: 155.72, name: 'Alphabet Inc.', sector: 'Technology' },
    'META': { price: 505.30, name: 'Meta Platforms', sector: 'Technology' },
    'RELIANCE.NS': { price: 2450.75, name: 'Reliance Industries', sector: 'Energy' },
    'TCS.NS': { price: 3890.40, name: 'Tata Consultancy', sector: 'Technology' },
    'INFY.NS': { price: 1520.30, name: 'Infosys Ltd.', sector: 'Technology' },
    'HDFCBANK.NS': { price: 1680.50, name: 'HDFC Bank', sector: 'Finance' },
    '0700.HK': { price: 378.40, name: 'Tencent Holdings', sector: 'Technology' },
    '9988.HK': { price: 82.15, name: 'Alibaba Group', sector: 'Consumer' },
    '0005.HK': { price: 65.30, name: 'HSBC Holdings', sector: 'Finance' },
  };

  return symbols.map((sym: string) => {
    const base = basePrices[sym] || { price: 100 + Math.random() * 200, name: sym, sector: 'Unknown' };
    const change = (Math.random() - 0.48) * base.price * 0.03;
    const price = base.price + change;
    return {
      symbol: sym,
      name: base.name,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / base.price) * 10000) / 100,
      volume: Math.floor(Math.random() * 80 + 10) + 'M',
      marketCap: Math.floor(Math.random() * 3000 + 100) + 'B',
      dayHigh: Math.round((price + Math.random() * 3) * 100) / 100,
      dayLow: Math.round((price - Math.random() * 3) * 100) / 100,
      market: market || 'US',
      sector: base.sector,
    };
  });
}
