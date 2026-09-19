import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToData } from '../services/dataSource.js';

/**
 * Run an async service call and keep it fresh.
 * Re-runs when deps change and whenever demo data changes.
 * Pass { dependsOn: query } for calls that need another query's result.
 * Returns { data, loading, error, reload }.
 */
export function useServiceQuery(fetcher, deps = [], { dependsOn } = {}) {
  const [state, setState] = useState({ query: null, data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);
  const waiting = dependsOn?.loading ?? false;
  const dependencyError = dependsOn?.error ?? null;

  const run = useCallback(async () => {
    if (waiting || dependencyError) return;
    const id = ++requestId.current;
    setState((previous) => previous.query === run
      ? previous
      : { query: run, data: null, error: null, loading: true });
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) {
        setState({ query: run, data: result, error: null, loading: false });
      }
    } catch (err) {
      if (id === requestId.current) {
        setState((previous) => ({ ...previous, query: run, error: err, loading: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, waiting, dependencyError]);

  useEffect(() => {
    run();
    const unsubscribe = subscribeToData(run);
    return () => {
      requestId.current += 1;
      unsubscribe();
    };
  }, [run]);

  // Derive loading during render, before the new query's effect runs.
  // Background refreshes of the same query keep their existing content visible.
  const current = state.query === run;
  return {
    data: current && !waiting && !dependencyError ? state.data : null,
    loading: waiting || (!dependencyError && (!current || state.loading)),
    error: dependencyError || (current ? state.error : null),
    reload: dependencyError ? dependsOn.reload : run,
  };
}
