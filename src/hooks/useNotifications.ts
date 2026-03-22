import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      if (backendApiEnabled()) {
        const res = await apiFetch<{ notifications: Notification[] }>('/api/notifications');
        setNotifications(res.notifications || []);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      if (backendApiEnabled()) {
        await apiFetch('/api/notifications', {
          method: 'PATCH',
          json: { id, read: true },
        });
        await fetchNotifications();
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllRead = async () => {
    if (!user) return;

    try {
      if (backendApiEnabled()) {
        await apiFetch('/api/notifications', {
          method: 'PATCH',
          json: { markAllRead: true },
        });
        await fetchNotifications();
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to new notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            
            // Show toast
            toast(newNotif.title, {
              description: newNotif.body,
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
  };
};
