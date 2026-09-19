/**
 * In-browser demo store used when Supabase is not in use.
 * Persists to localStorage so demo progress survives a refresh.
 * Components never import this directly — they go through services.
 */
import { createInitialState } from '../data/mockData.js';

const STORAGE_KEY = 'rsf-demo-state-v1';
const listeners = new Set();

function load() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1) return parsed;
    }
  } catch {
    /* corrupted or unavailable storage — start fresh */
  }
  return createInitialState();
}

let state = load();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — keep working in memory */
  }
}

export function getState() {
  return state;
}

export function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  persist();
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetDemoState() {
  state = createInitialState();
  persist();
  listeners.forEach((listener) => listener());
}

/** Tiny latency so loading states are visible and code paths match async Supabase calls. */
export function simulateLatency(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
