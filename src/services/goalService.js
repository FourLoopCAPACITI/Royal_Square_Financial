/** Individual and shared household goals. No investment recommendations here. */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, simulateLatency } from './store.js';
import { mapGoal } from './mappers.js';

/** Goals for a client, including goals of any household they belong to. */
export async function listGoals({ clientId, adviserId } = {}) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('goals').select('*').order('created_at');
    if (error) throw error;
    return data.map(mapGoal); // RLS limits rows to the client's own / household / assigned clients.
  }
  await simulateLatency();
  const { goals, clients, households } = getState();
  if (clientId) {
    const client = clients.find((c) => c.id === clientId);
    return goals.filter((g) => g.clientId === clientId || (g.householdId && g.householdId === client?.householdId));
  }
  if (adviserId) {
    const mine = clients.filter((c) => c.adviserIds.includes(adviserId));
    const ids = new Set(mine.map((c) => c.id));
    const hh = new Set(households.filter((h) => h.memberIds.some((m) => ids.has(m))).map((h) => h.id));
    return goals.filter((g) => ids.has(g.clientId) || hh.has(g.householdId));
  }
  return goals;
}
