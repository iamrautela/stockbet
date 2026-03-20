import { useQuery } from '@tanstack/react-query';
import { fetchMarketData, type LiveStock } from '@/lib/market-api';

export function useMarketData(market: string) {
  return useQuery<LiveStock[]>({
    queryKey: ['market-data', market],
    queryFn: () => fetchMarketData(market),
    refetchInterval: 15000,
    staleTime: 10000,
    retry: 1,
    // Always return empty array on error so UI never shows broken state
    placeholderData: [],
  });
}
