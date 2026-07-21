import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useRealtime } from './RealtimeContext';

const OwnerPlanContext = createContext(null);

// Loads the owner's subscription summary and shares it across the owner area so
// every page knows whether the plan is active. Data is never gated — only the
// ability to use "major" write features.
export function OwnerPlanProvider({ children }) {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const { subscribe } = useRealtime();

  const refresh = useCallback(
    () =>
      api.subscription
        .get()
        .then((s) => setSub(s))
        .catch(() => {})
        .finally(() => setLoading(false)),
    [],
  );

  // Refresh on first load and whenever the owner navigates (cheap, and keeps the
  // gate current right after subscribing on the Subscription page).
  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  // A plan or booking change elsewhere can affect status — refresh live too.
  useEffect(() => subscribe('activity', refresh), [subscribe, refresh]);

  // Active until we know otherwise, so the UI never flashes "expired" while loading.
  const isActive = sub ? sub.isActive !== false : true;

  return (
    <OwnerPlanContext.Provider value={{ sub, isActive, loading, refresh }}>
      {children}
    </OwnerPlanContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOwnerPlan() {
  return (
    useContext(OwnerPlanContext) ?? {
      sub: null,
      isActive: true,
      loading: false,
      refresh: () => {},
    }
  );
}
