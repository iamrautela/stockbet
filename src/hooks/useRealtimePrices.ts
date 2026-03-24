import { useQuery } from '@tanstack/react-query';
import { fetchRealtimePrices } from '@/lib/realtime-prices';

/**
 * Polls real-time prices for the given symbols every 15 seconds.
 * Returns a map of symbol → current price.
 */
export function useRealtimePrices(symbols: string[]) {
  const key = symbols.slice().sort().join(',');
  return useQuery<Record<string, number>>({
    queryKey: ['realtime-prices', key],
    queryFn: () => fetchRealtimePrices(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
    placeholderData: {},
  });
}
