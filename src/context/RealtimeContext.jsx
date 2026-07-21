import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, realtimeUrl } from '../lib/api';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext(null);

// Opens a single Server-Sent Events connection while the user is signed in and
// fans incoming events out to:
//   • the notification bell (persisted notifications + unread count)
//   • any page that subscribes to an event type (e.g. "reservation") so it can
//     refetch its data live — no page refresh required.
export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Map<eventType, Set<handler>> — page subscriptions, kept in a ref so the
  // `subscribe` function stays stable across renders.
  const listenersRef = useRef(new Map());

  const dispatch = useCallback((event) => {
    const handlers = listenersRef.current.get(event.type);
    if (handlers) handlers.forEach((fn) => fn(event));
  }, []);

  const subscribe = useCallback((type, handler) => {
    const map = listenersRef.current;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type).add(handler);
    return () => {
      const set = map.get(type);
      if (set) {
        set.delete(handler);
        if (set.size === 0) map.delete(type);
      }
    };
  }, []);

  // Load persisted notifications + open the live stream when signed in.
  useEffect(() => {
    if (!user) return undefined;

    let closed = false;

    api.notifications
      .list()
      .then((list) => {
        if (!closed) setNotifications(list);
      })
      .catch(() => {});

    const source = new EventSource(realtimeUrl(), { withCredentials: true });
    source.onmessage = (e) => {
      let event;
      try {
        event = JSON.parse(e.data);
      } catch {
        return;
      }
      if (event.type === 'ping') return;
      if (event.type === 'notification') {
        setNotifications((prev) => [event.notification, ...prev].slice(0, 50));
      }
      dispatch(event);
    };
    // EventSource reconnects automatically on transient errors; nothing to do.
    source.onerror = () => {};

    // On sign-out (user → null) this cleanup closes the stream and drops any
    // notifications belonging to the previous session.
    return () => {
      closed = true;
      source.close();
      setNotifications([]);
    };
  }, [user, dispatch]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch {
      /* optimistic; the next fetch will reconcile */
    }
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await api.notifications.markRead(id);
    } catch {
      /* optimistic */
    }
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, markAllRead, markRead, subscribe }),
    [notifications, unreadCount, markAllRead, markRead, subscribe],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRealtime() {
  return useContext(RealtimeContext) ?? EMPTY;
}

// Safe fallback so components work even if rendered outside the provider
// (e.g. public pages) — subscribe is a no-op and there are no notifications.
const EMPTY = {
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  subscribe: () => () => {},
};

// Convenience hook: run `handler` whenever an event of `type` arrives.
// eslint-disable-next-line react-refresh/only-export-components
export function useRealtimeEvent(type, handler) {
  const { subscribe } = useRealtime();
  useEffect(() => subscribe(type, handler), [subscribe, type, handler]);
}
