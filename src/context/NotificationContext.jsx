import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSession } from './SessionContext.jsx';
import { useServiceQuery } from '../hooks/useServiceQuery.js';
import { listNotifications, notificationReadKey, readNotificationIds, saveNotificationIds } from '../services/notificationService.js';

const NotificationContext = createContext(null);

function RecipientNotifications({ scope, role, children }) {
  const query = useServiceQuery(() => listNotifications(role), [role]);
  const [readIds, setReadIds] = useState(() => readNotificationIds(scope));

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') query.reload();
    };
    const syncRead = (event) => {
      if (event.key === notificationReadKey(scope) || event.key === null) setReadIds(readNotificationIds(scope));
    };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('storage', syncRead);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('storage', syncRead);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [query.reload, scope]);

  const markRead = useCallback((ids) => {
    setReadIds((previous) => {
      const next = new Set([...readNotificationIds(scope), ...previous, ...ids]);
      saveNotificationIds(scope, next);
      return next;
    });
  }, [scope]);
  const notifications = (query.data || []).map((item) => ({ ...item, read: readIds.has(item.id) }));
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <NotificationContext.Provider value={{ query, notifications, unread, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationProvider({ children }) {
  const { role, user, isDemo, loading } = useSession();
  if (loading || !['client', 'adviser'].includes(role)) {
    return <NotificationContext.Provider value={null}>{children}</NotificationContext.Provider>;
  }
  const scope = `${isDemo ? 'demo' : user.id}:${role}`;
  return <RecipientNotifications key={scope} scope={scope} role={role}>{children}</RecipientNotifications>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
