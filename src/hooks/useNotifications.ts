import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useNotifications() {
  // Poll every 30 seconds for new notifications
  const { data, error, mutate, isLoading } = useSWR('/notifications', fetcher, {
    refreshInterval: 30000,
  });

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      mutate();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      mutate();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return {
    notifications: data || [],
    unreadCount: data ? data.filter((n: any) => !n.is_read).length : 0,
    isLoading,
    isError: error,
    markAsRead,
    markAllAsRead,
    mutate
  };
}
