/**
 * Pushes locally saved accident reports once connectivity returns.
 * Each synced report becomes a claim + motor claim workflow + adviser task.
 */
import { isOnline, listPendingReports, onConnectivityChange, removePendingReport } from './offlineService.js';
import { createClaimFromReport } from './claimService.js';

let syncing = false;

export async function syncPendingReports() {
  if (syncing || !isOnline()) return [];
  syncing = true;
  const results = [];
  try {
    for (const report of listPendingReports()) {
      try {
        const created = await createClaimFromReport(report);
        removePendingReport(report.localId);
        results.push({ localId: report.localId, ok: true, workflowId: created.workflow.id });
      } catch (error) {
        // Leave it in the queue; it will retry on the next reconnect.
        results.push({ localId: report.localId, ok: false, error: String(error?.message || error) });
      }
    }
  } finally {
    syncing = false;
  }
  return results;
}

/** Start listening for reconnects. Returns an unsubscribe function. */
export function startAutoSync(onSynced) {
  return onConnectivityChange(async (online) => {
    if (!online) return;
    const results = await syncPendingReports();
    if (results.length && onSynced) onSynced(results);
  });
}
