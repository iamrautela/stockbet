import { supabase } from '@/integrations/supabase/client';

export interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  market: string;
  sector: string;
}

const MARKET_SYMBOLS: Record<string, string[]> = {
  US: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'],
  IN: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'],
  HK: ['0700.HK', '9988.HK', '0005.HK'],
};

export async function fetchMarketData(market: string): Promise<LiveStock[]> {
  const symbols = MARKET_SYMBOLS[market] || MARKET_SYMBOLS.US;

  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { symbols, market },
  });

  if (error) {
    console.error('Market data fetch error:', error);
    throw error;
  }

  return data.stocks || [];
}

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { symbols: [symbol], market: 'US' },
  });

  if (error || !data?.stocks?.length) return null;
  return data.stocks[0].price;
}

export { MARKET_SYMBOLS };
