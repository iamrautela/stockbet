import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type IPO = Tables<'ipos'>;

export const useIPOs = () => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIPOs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ipos')
        .select('*')
        .order('listing_date', { ascending: true });

      if (fetchError) throw fetchError;
      setIpos(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching IPOs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, []);

  const getIPOsByStatus = (status: string) => {
    return ipos.filter((ipo) => ipo.status === status);
  };

  return {
    ipos,
    isLoading,
    error,
    refetch: fetchIPOs,
    getIPOsByStatus,
  };
};
