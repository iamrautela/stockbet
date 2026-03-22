import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Bet = Tables<'bets'>;

export const useRealtimeBets = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBets = async () => {
    if (!user) return;

    try {
      if (backendApiEnabled()) {
        const res = await apiFetch<{ bets: Bet[] }>('/api/bets?status=all');
        setBets(res.bets || []);
        return;
      }

      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBets();

      // Subscribe to realtime changes
      const channel = supabase
        .channel('bets-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bets',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setBets([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    bets,
    isLoading,
    refetch: fetchBets,
  };
};
