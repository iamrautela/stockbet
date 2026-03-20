import { useQuery } from '@tanstack/react-query';
import { fetchMarketData, type LiveStock } from '@/lib/market-api';

export function useMarketData(market: string) {
  return useQuery<LiveStock[]>({
    queryKey: ['market-data', market],
    queryFn: () => fetchMarketData(market),
    refetchInterval: 30000, // refresh every 30s
    staleTime: 15000,
    retry: 2,
  });
}
