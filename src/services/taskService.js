/** Tasks and reminders ("My Actions"). */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, setState, simulateLatency } from './store.js';
import { mapTask } from './mappers.js';

export async function listTasks({ clientId, assignee, adviserId, status = 'open' } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('tasks').select('*').order('due_date');
    if (clientId) query = query.eq('client_id', clientId);
    if (assignee) query = query.eq('assignee_role', assignee);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapTask);
  }
  await simulateLatency();
  const { tasks, clients } = getState();
  const adviserClients = adviserId ? new Set(clients.filter((c) => c.adviserIds.includes(adviserId)).map((c) => c.id)) : null;
  return tasks
    .filter((t) => (!clientId || t.clientId === clientId) && (!assignee || t.assignee === assignee) && (!status || t.status === status))
    .filter((t) => !adviserClients || adviserClients.has(t.clientId))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

export async function completeTask(taskId) {
  if (await useSupabase()) {
    const { error } = await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId);
    if (error) throw error;
    return;
  }
  setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)) }));
}

export async function listReminders({ clientId } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('reminders').select('*').order('remind_at');
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map((r) => ({ id: r.id, clientId: r.client_id, documentId: r.document_id, title: r.title, remindAt: r.remind_at, channel: r.channel }));
  }
  await simulateLatency();
  return getState().reminders.filter((r) => !clientId || r.clientId === clientId);
}
