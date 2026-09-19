/**
 * Decides where data comes from:
 *   Supabase configured AND a user is signed in  → Supabase
 *   otherwise                                     → mock data (src/data/mockData.js)
 * Demo mode never needs real accounts, so the hackathon demo always works.
 */
import { supabase, isSupabaseConfigured } from './supabase.js';
import { subscribe as subscribeToStore } from './store.js';

let cachedMode = null;
const changeListeners = new Set();

/** Refresh mounted queries after a successful remote mutation. */
export function notifyDataChanged() {
  changeListeners.forEach((listener) => listener());
}

export async function getDataMode() {
  if (!isSupabaseConfigured || !supabase) return 'mock';
  try {
    const { data } = await supabase.auth.getSession();
    cachedMode = data?.session ? 'supabase' : 'mock';
  } catch {
    cachedMode = 'mock';
  }
  return cachedMode;
}

export async function useSupabase() {
  return (await getDataMode()) === 'supabase';
}

export function getCachedDataMode() {
  return cachedMode || (isSupabaseConfigured ? 'checking' : 'mock');
}

/** Subscribe to data changes (mock store changes; Supabase realtime can be added here later). */
export function subscribeToData(listener) {
  changeListeners.add(listener);
  const unsubscribe = subscribeToStore(listener);
  return () => {
    changeListeners.delete(listener);
    unsubscribe();
  };
}
