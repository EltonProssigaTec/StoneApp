/**
 * Hook de Notificações
 * Gerencia o estado de notificações no app
 */

import notificationService from '@/services/notifications';
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    const count = await notificationService.getUnreadCount();
    setUnreadCount(count);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUnreadCount();

    // Atualiza a cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const refresh = useCallback(async () => {
    await loadUnreadCount();
  }, [loadUnreadCount]);

  return {
    unreadCount,
    loading,
    refresh,
  };
}
