/** Online/offline state (real + demo toggle) and automatic sync of offline accident reports. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isOnline, listPendingReports, onConnectivityChange, setSimulatedOffline } from '../services/offlineService.js';
import { startAutoSync, syncPendingReports } from '../services/syncService.js';

const ConnectivityContext = createContext(null);

export function ConnectivityProvider({ children }) {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(listPendingReports().length);
  const [lastSync, setLastSync] = useState(null);

  const refreshPending = useCallback(() => setPendingCount(listPendingReports().length), []);

  useEffect(() => {
    const offConn = onConnectivityChange((next) => setOnline(next));
    const offSync = startAutoSync((results) => {
      setLastSync({ at: new Date().toISOString(), results });
      refreshPending();
    });
    // Anything left from a previous session?
    syncPendingReports().then((results) => {
      if (results.length) setLastSync({ at: new Date().toISOString(), results });
      refreshPending();
    });
    return () => {
      offConn();
      offSync();
    };
  }, [refreshPending]);

  const value = useMemo(
    () => ({
      online,
      pendingCount,
      lastSync,
      refreshPending,
      clearLastSync: () => setLastSync(null),
      setDemoOffline: (offline) => setSimulatedOffline(offline),
    }),
    [online, pendingCount, lastSync, refreshPending],
  );

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used inside <ConnectivityProvider>');
  return ctx;
}
