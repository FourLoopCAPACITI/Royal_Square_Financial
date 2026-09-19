/**
 * Reusable workflow engine — pure functions, no React, no Supabase.
 * Every process (claims, life events, service requests, reviews) runs through here.
 *
 * Workflow shape:
 * { id, clientId, type, title, providerId, status, currentOwner, currentStep,
 *   nextAction, dueDate, priority, createdAt, updatedAt, steps: WorkflowStep[] }
 *
 * WorkflowStep shape:
 * { id, key, label, owner, status: 'complete'|'current'|'upcoming', nextAction,
 *   dueInDays, startedAt, completedAt }
 */
import { getTemplate } from './workflowTemplates.js';
import { daysFromNow, startOfDay, uid } from './format.js';

export const OWNERS = ['client', 'adviser', 'provider', 'repairer', 'system'];

export const WORKFLOW_STATUS = {
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
};

/** Human label for an owner. Pass the provider name when you have it. */
export function getOwnerLabel(owner, { providerName, viewerRole, clientName } = {}) {
  switch (owner) {
    case 'client':
      return viewerRole === 'client' ? 'You' : clientName || 'Client';
    case 'adviser':
      return 'Royal Square';
    case 'provider':
      return providerName || 'Provider';
    case 'repairer':
      return 'Repairer';
    case 'system':
      return 'Automatic';
    default:
      return 'Unassigned';
  }
}

export function getCurrentStep(workflow) {
  if (!workflow?.steps?.length) return null;
  return workflow.steps[workflow.currentStep] ?? null;
}

export function getNextStep(workflow) {
  if (!workflow?.steps?.length) return null;
  return workflow.steps[workflow.currentStep + 1] ?? null;
}

export function getCurrentOwner(workflow) {
  if (!workflow || workflow.status !== WORKFLOW_STATUS.active) return null;
  return getCurrentStep(workflow)?.owner ?? workflow.currentOwner ?? null;
}

/** Percentage of completed steps (0–100). */
export function getWorkflowProgress(workflow) {
  if (!workflow?.steps?.length) return 0;
  if (workflow.status === WORKFLOW_STATUS.completed) return 100;
  const done = workflow.steps.filter((s) => s.status === 'complete').length;
  return Math.round((done / workflow.steps.length) * 100);
}

export function isWorkflowOverdue(workflow, now = new Date()) {
  if (!workflow || workflow.status !== WORKFLOW_STATUS.active || !workflow.dueDate) return false;
  return new Date(workflow.dueDate) < startOfDay(now);
}

/** Build a fresh workflow from a template. Returns { workflow, event }. */
export function createWorkflow(
  type,
  { clientId, providerId = null, title, priority = 'normal', startAt = 0, actorType = 'system', actorName = 'System', now = new Date() } = {},
) {
  const template = getTemplate(type);
  const nowIso = now.toISOString();
  const steps = template.steps.map((def, index) => ({
    id: uid('step'),
    key: def.key,
    label: def.label,
    owner: def.owner,
    nextAction: def.nextAction,
    dueInDays: def.dueInDays,
    status: index < startAt ? 'complete' : index === startAt ? 'current' : 'upcoming',
    startedAt: index <= startAt ? nowIso : null,
    completedAt: index < startAt ? nowIso : null,
  }));
  const current = steps[startAt];
  const workflow = {
    id: uid('wf'),
    clientId,
    type,
    title: title || template.label,
    providerId,
    status: WORKFLOW_STATUS.active,
    currentOwner: current.owner,
    currentStep: startAt,
    nextAction: current.nextAction,
    dueDate: daysFromNow(current.dueInDays ?? 2, 17, 0, now),
    priority,
    createdAt: nowIso,
    updatedAt: nowIso,
    steps,
  };
  const event = createActivityEvent(workflow, { actorType, actorName, message: `${workflow.title} started`, now });
  return { workflow, event };
}

/**
 * Complete the current step and move to the next one.
 * Returns { workflow, event } — never mutates the input.
 */
export function advanceWorkflow(workflow, { actorType = 'adviser', actorName = 'Royal Square', note, now = new Date() } = {}) {
  if (!workflow || workflow.status !== WORKFLOW_STATUS.active) {
    return { workflow, event: null };
  }
  const nowIso = now.toISOString();
  const index = workflow.currentStep;
  const finished = workflow.steps[index];
  const nextIndex = index + 1;
  const isLast = nextIndex >= workflow.steps.length;

  const steps = workflow.steps.map((step, i) => {
    if (i === index) return { ...step, status: 'complete', completedAt: nowIso };
    if (i === nextIndex) return { ...step, status: 'current', startedAt: nowIso };
    return step;
  });

  const next = steps[nextIndex];
  const updated = {
    ...workflow,
    steps,
    currentStep: isLast ? index : nextIndex,
    status: isLast ? WORKFLOW_STATUS.completed : WORKFLOW_STATUS.active,
    currentOwner: isLast ? null : next.owner,
    nextAction: isLast ? 'No further action' : next.nextAction,
    dueDate: isLast ? null : daysFromNow(next.dueInDays ?? 2, 17, 0, now),
    updatedAt: nowIso,
  };

  const event = createActivityEvent(updated, {
    actorType,
    actorName,
    message: note || `${finished.label} completed${isLast ? '. Process closed' : ''}`,
    now,
  });
  return { workflow: updated, event };
}

export function createActivityEvent(workflow, { actorType = 'system', actorName = 'System', message, now = new Date() }) {
  return {
    id: uid('evt'),
    workflowId: workflow?.id ?? null,
    clientId: workflow?.clientId ?? null,
    at: now.toISOString(),
    actorType,
    actorName,
    message,
  };
}

/**
 * Collapse steps into the distinct parties involved, in order of first appearance.
 * Used by <WorkflowOwner/> to show who is holding the ball.
 * state: 'complete' | 'current' | 'paused' (done for now, involved later) | 'later'
 */
export function getOwnerSequence(workflow) {
  if (!workflow?.steps) return [];
  const order = [];
  const byOwner = {};
  workflow.steps.forEach((step) => {
    if (!byOwner[step.owner]) {
      byOwner[step.owner] = { owner: step.owner, steps: [] };
      order.push(step.owner);
    }
    byOwner[step.owner].steps.push(step);
  });
  const currentOwner = getCurrentOwner(workflow);
  return order.map((owner) => {
    const { steps } = byOwner[owner];
    const done = steps.filter((s) => s.status === 'complete').length;
    let state = 'later';
    if (owner === currentOwner) state = 'current';
    else if (done === steps.length) state = 'complete';
    else if (done > 0) state = 'paused';
    return { owner, state, stepCount: steps.length, completedCount: done };
  });
}

/** Adviser Action Inbox grouping. Overdue wins over every other bucket. */
export function groupWorkflowsForInbox(workflows, now = new Date()) {
  const groups = { needsMe: [], waitingOnClient: [], waitingOnProvider: [], overdue: [] };
  workflows
    .filter((w) => w.status === WORKFLOW_STATUS.active)
    .forEach((w) => {
      if (isWorkflowOverdue(w, now)) groups.overdue.push(w);
      else if (w.currentOwner === 'adviser' || w.currentOwner === 'system') groups.needsMe.push(w);
      else if (w.currentOwner === 'client') groups.waitingOnClient.push(w);
      else groups.waitingOnProvider.push(w);
    });
  const byDue = (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
  Object.values(groups).forEach((list) => list.sort(byDue));
  return groups;
}

/** Short status phrase such as "Waiting on Santam". */
export function describeWorkflowStatus(workflow, opts = {}) {
  if (!workflow) return '';
  if (workflow.status === WORKFLOW_STATUS.completed) return 'Completed';
  if (workflow.status === WORKFLOW_STATUS.cancelled) return 'Cancelled';
  const owner = getCurrentOwner(workflow);
  if (owner === 'client') return opts.viewerRole === 'client' ? 'Waiting on you' : 'Waiting on client';
  if (owner === 'adviser') return 'With Royal Square';
  if (owner === 'system') return 'Processing';
  return `Waiting on ${getOwnerLabel(owner, opts)}`;
}

/** When did the current step start? Used for "Waiting 3 days". */
export function getCurrentStepStartedAt(workflow) {
  return getCurrentStep(workflow)?.startedAt || workflow?.updatedAt || null;
}
