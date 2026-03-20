import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWallet, getOpenBets, getBetHistory, getWalletTransactions, placeBet, type PlaceBetParams } from '@/lib/betting-api';
import { toast } from 'sonner';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    staleTime: 5000,
  });
}

export function useOpenBets() {
  return useQuery({
    queryKey: ['bets', 'open'],
    queryFn: getOpenBets,
    refetchInterval: 10000,
  });
}

export function useBetHistory() {
  return useQuery({
    queryKey: ['bets', 'history'],
    queryFn: getBetHistory,
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: getWalletTransactions,
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PlaceBetParams) => placeBet(params),
    onSuccess: () => {
      toast.success('Bet placed successfully!');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place bet');
    },
  });
}
