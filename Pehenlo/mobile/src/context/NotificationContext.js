import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import notificationApi, {
  consumeInitialNotification,
  registerDeviceToken,
  setupNotificationListeners,
  syncBadge,
  unregisterDeviceToken,
} from '../services/notificationService';
import { clearPendingNotifications, flushPendingNotifications, openNotificationTarget } from '../utils/notificationNavigation';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      await syncBadge(0);
      return 0;
    }
    try {
      const response = await notificationApi.getUnreadCount();
      const count = response?.data?.unreadCount || 0;
      setUnreadCount(count);
      await syncBadge(count);
      return count;
    } catch (_error) {
      return 0;
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async ({ page: nextPage = 1, category = '', replace = true } = {}) => {
    if (!isAuthenticated) return;
    if (replace && nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const response = await notificationApi.getNotifications({ page: nextPage, limit: 20, category });
      const nextItems = response?.data?.items || [];
      setItems((current) => (replace ? nextItems : [...current, ...nextItems]));
      setPage(nextPage);
      setHasNextPage(Boolean(response?.data?.pagination?.hasNextPage));
    } catch (loadError) {
      if (replace) setError(loadError.message || "Couldn't load notifications.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const refreshNotifications = useCallback(async (category) => {
    setRefreshing(true);
    await fetchNotifications({ page: 1, category, replace: true });
    await refreshUnreadCount();
  }, [fetchNotifications, refreshUnreadCount]);

  const markAsRead = useCallback(async (notificationId) => {
    const response = await notificationApi.markNotificationRead(notificationId);
    setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
    setUnreadCount(response?.data?.unreadCount || 0);
    await syncBadge(response?.data?.unreadCount || 0);
  }, []);

  const markAllAsRead = useCallback(async () => {
    const response = await notificationApi.markAllNotificationsRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(response?.data?.unreadCount || 0);
    await syncBadge(0);
  }, []);

  const openNotification = useCallback(async (notification) => {
    if (notification?.id && !notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (_error) {
        // Opening the target still works if marking read fails.
      }
    }
    openNotificationTarget(notification?.data || {});
    setBanner(null);
  }, [markAsRead]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      setBanner(null);
      clearPendingNotifications();
      unregisterDeviceToken();
      syncBadge(0);
      return undefined;
    }
    refreshUnreadCount();
    registerDeviceToken().catch(() => {});
    const remove = setupNotificationListeners({
      onReceive: (data) => {
        refreshUnreadCount();
        if (data?.title || data?.body) {
          setBanner({ title: data.title || 'Pehenlo', message: data.body || 'You have a new update.', data });
        } else {
          setBanner({ title: 'New update', message: 'Tap to view', data });
        }
      },
      onResponse: (data) => {
        if (data?.notificationId) {
          notificationApi.markNotificationRead(data.notificationId).catch(() => {}).finally(refreshUnreadCount);
        }
        openNotificationTarget(data || {});
      },
    });
    consumeInitialNotification().then((data) => {
      if (data?.notificationId) {
        notificationApi.markNotificationRead(data.notificationId).catch(() => {}).finally(refreshUnreadCount);
      }
      if (data) openNotificationTarget(data);
      flushPendingNotifications();
    }).catch(() => {});
    return remove;
  }, [isAuthenticated, refreshUnreadCount]);

  const value = useMemo(() => ({
    items,
    unreadCount,
    page,
    hasNextPage,
    loading,
    refreshing,
    loadingMore,
    error,
    banner,
    dismissBanner: () => setBanner(null),
    fetchNotifications,
    refreshNotifications,
    loadMoreNotifications: (category) => {
      if (hasNextPage && !loadingMore) fetchNotifications({ page: page + 1, category, replace: false });
    },
    markAsRead,
    markAllAsRead,
    openNotification,
    refreshUnreadCount,
  }), [
    items, unreadCount, page, hasNextPage, loading, refreshing, loadingMore, error, banner,
    fetchNotifications, refreshNotifications, markAsRead, markAllAsRead, openNotification, refreshUnreadCount,
  ]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
