import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Wallet = Tables<'wallets'>;
type Transaction = Tables<'wallet_transactions'>;

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) return;

    try {
      if (backendApiEnabled()) {
        const row = await apiFetch<Wallet>('/api/wallet');
        setWallet(row as Wallet);
        return;
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      if (backendApiEnabled()) {
        const res = await apiFetch<{ transactions: Transaction[] }>('/api/transactions');
        setTransactions(res.transactions || []);
        return;
      }

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await Promise.all([fetchWallet(), fetchTransactions()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      refetch();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('wallet-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchWallet();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setWallet(null);
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    wallet,
    transactions,
    isLoading,
    refetch,
  };
};
