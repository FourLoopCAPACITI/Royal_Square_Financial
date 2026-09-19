/**
 * Offline SOS foundation.
 *
 * Future flow (Capacitor):
 *   Accident → no internet → capture evidence locally → save report locally
 *   → connectivity returns → sync to Supabase → create claim workflow → notify adviser
 *
 * Web prototype: localStorage + a demo Online/Offline toggle.
 * Capacitor migration: swap the storage calls for @capacitor/preferences (or
 * @capacitor/filesystem for photos) and the connectivity calls for @capacitor/network.
 */
const QUEUE_KEY = 'rsf-offline-reports-v1';
const DRAFT_KEY = 'rsf-accident-draft-v1';

// ── Connectivity ───────────────────────────────────────────
let simulatedOffline = false;
const connectivityListeners = new Set();

export function isOnline() {
  const browserOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
  return browserOnline && !simulatedOffline;
}

/** Demo toggle — lets the team show offline behaviour without switching off Wi-Fi. */
export function setSimulatedOffline(value) {
  simulatedOffline = Boolean(value);
  connectivityListeners.forEach((l) => l(isOnline()));
}

export function onConnectivityChange(listener) {
  connectivityListeners.add(listener);
  const handler = () => listener(isOnline());
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    connectivityListeners.delete(listener);
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

// ── Local storage helpers ──────────────────────────────────
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ── Pending report queue ───────────────────────────────────
export function savePendingReport(report) {
  const queue = read(QUEUE_KEY, []);
  const entry = { ...report, savedOfflineAt: new Date().toISOString(), capturedOffline: true };
  write(QUEUE_KEY, [...queue.filter((r) => r.localId !== report.localId), entry]);
  return entry;
}

export function listPendingReports() {
  return read(QUEUE_KEY, []);
}

export function removePendingReport(localId) {
  write(QUEUE_KEY, read(QUEUE_KEY, []).filter((r) => r.localId !== localId));
}

// ── In-progress draft (survives refresh / app close) ───────
export function saveDraft(report) {
  write(DRAFT_KEY, report);
}

export function loadDraft() {
  return read(DRAFT_KEY, null);
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
