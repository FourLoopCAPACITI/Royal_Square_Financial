import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToData } from '../services/dataSource.js';

/**
 * Run an async service call and keep it fresh.
 * Re-runs when deps change and whenever demo data changes.
 * Returns { data, loading, error, reload }.
 */
export function useServiceQuery(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const hasLoaded = useRef(false);

  const run = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let active = true;
    hasLoaded.current = false;
    run();
    const unsubscribe = subscribeToData(() => active && run());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [run]);

  return { data, loading, error, reload: run };
}
