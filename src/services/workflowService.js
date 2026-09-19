/**
 * Workflow persistence. Business rules live in utils/workflow.js;
 * this file only loads and saves workflows, steps and activity events.
 */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, setState, simulateLatency } from './store.js';
import { mapEvent, mapWorkflow, stepToRow, workflowToRow } from './mappers.js';
import { advanceWorkflow, createWorkflow } from '../utils/workflow.js';
import { uid, daysFromNow } from '../utils/format.js';

const WORKFLOW_SELECT = '*, workflow_steps(*)';

export async function listWorkflows({ clientId, adviserId, includeCompleted = true } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('workflows').select(WORKFLOW_SELECT).order('due_date', { ascending: true });
    if (clientId) query = query.eq('client_id', clientId);
    if (!includeCompleted) query = query.eq('status', 'active');
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapWorkflow);
  }
  await simulateLatency();
  const { workflows, clients } = getState();
  let list = workflows;
  if (clientId) list = list.filter((w) => w.clientId === clientId);
  if (adviserId) {
    const mine = new Set(clients.filter((c) => c.adviserIds.includes(adviserId)).map((c) => c.id));
    list = list.filter((w) => mine.has(w.clientId));
  }
  if (!includeCompleted) list = list.filter((w) => w.status === 'active');
  return list;
}

export async function getWorkflow(workflowId) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('workflows').select(WORKFLOW_SELECT).eq('id', workflowId).maybeSingle();
    if (error) throw error;
    return mapWorkflow(data);
  }
  await simulateLatency();
  return getState().workflows.find((w) => w.id === workflowId) || null;
}

export async function listActivity({ workflowId, clientId, limit = 50 } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('activity_events').select('*').order('occurred_at', { ascending: false }).limit(limit);
    if (workflowId) query = query.eq('workflow_id', workflowId);
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapEvent);
  }
  await simulateLatency();
  return getState()
    .activityEvents.filter((e) => (!workflowId || e.workflowId === workflowId) && (!clientId || e.clientId === clientId))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}

/** Save a newly created workflow (+ its first activity event). */
export async function saveNewWorkflow(workflow, events = []) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('workflows').insert(workflowToRow(workflow)).select().single();
    if (error) throw error;
    const stepRows = workflow.steps.map((s, i) => stepToRow(s, data.id, i));
    const { error: stepError } = await supabase.from('workflow_steps').insert(stepRows);
    if (stepError) throw stepError;
    await recordEvents(events.map((e) => ({ ...e, workflowId: data.id })));
    return { ...workflow, id: data.id };
  }
  setState((s) => ({ ...s, workflows: [workflow, ...s.workflows], activityEvents: [...events, ...s.activityEvents] }));
  return workflow;
}

export async function recordEvents(events) {
  const valid = events.filter(Boolean);
  if (!valid.length) return;
  if (await useSupabase()) {
    const rows = valid.map((e) => ({
      workflow_id: e.workflowId,
      client_id: e.clientId,
      actor_type: e.actorType,
      actor_name: e.actorName,
      event_type: 'workflow',
      message: e.message,
      occurred_at: e.at,
    }));
    const { error } = await supabase.from('activity_events').insert(rows);
    if (error) throw error;
    return;
  }
  setState((s) => ({ ...s, activityEvents: [...valid, ...s.activityEvents] }));
}

/** Create a workflow from a template and persist it. */
export async function startWorkflow(type, options) {
  const { workflow, event } = createWorkflow(type, options);
  const saved = await saveNewWorkflow(workflow, [event]);
  await createOwnerTask(saved);
  return saved;
}

/** Complete the current step and move the ball to the next owner. */
export async function advance(workflowId, actor = {}) {
  const current = await getWorkflow(workflowId);
  if (!current) throw new Error('Workflow not found');
  const { workflow, event } = advanceWorkflow(current, actor);
  if (!event) return current;

  if (await useSupabase()) {
    const { error } = await supabase.from('workflows').update(workflowToRow(workflow)).eq('id', workflowId);
    if (error) throw error;
    const changed = workflow.steps.filter((s, i) => s.status !== current.steps[i].status);
    for (const step of changed) {
      const { error: stepError } = await supabase
        .from('workflow_steps')
        .update({ status: step.status, started_at: step.startedAt, completed_at: step.completedAt })
        .eq('id', step.id);
      if (stepError) throw stepError;
    }
    await recordEvents([event]);
  } else {
    setState((s) => ({
      ...s,
      workflows: s.workflows.map((w) => (w.id === workflowId ? workflow : w)),
      activityEvents: [event, ...s.activityEvents],
      // Close tasks linked to the step that just finished.
      tasks: s.tasks.map((t) => (t.workflowId === workflowId && t.status === 'open' ? { ...t, status: 'done' } : t)),
    }));
  }
  await createOwnerTask(workflow);
  return workflow;
}

/** When the ball lands with the client or adviser, give them a task. */
async function createOwnerTask(workflow) {
  if (workflow.status !== 'active' || !['client', 'adviser'].includes(workflow.currentOwner)) return;
  if (await useSupabase()) return; // In Supabase, a database trigger or Edge Function can own this later.
  const client = getState().clients.find((c) => c.id === workflow.clientId);
  const task = {
    id: uid('task'),
    clientId: workflow.clientId,
    workflowId: workflow.id,
    taskKey: `wf_${workflow.currentStep}`,
    assignee: workflow.currentOwner,
    adviserId: workflow.currentOwner === 'adviser' ? client?.adviserIds?.[0] : undefined,
    kind: 'task',
    title: workflow.nextAction,
    description: `${workflow.title}${client ? ` · ${client.name}` : ''}`,
    dueDate: workflow.dueDate || daysFromNow(2),
    status: 'open',
    priority: workflow.priority,
  };
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
}
