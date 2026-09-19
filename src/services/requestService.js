/** Client Service Centre — every request is a workflow built from a template. */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, setState, simulateLatency } from './store.js';
import { startWorkflow } from './workflowService.js';
import { getServiceRequestType } from '../utils/workflowTemplates.js';
import { uid } from '../utils/format.js';

export async function listServiceRequests({ clientId, adviserId } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map((r) => ({ id: r.id, clientId: r.client_id, type: r.request_type, workflowId: r.workflow_id, status: r.status, createdAt: r.created_at, details: r.details }));
  }
  await simulateLatency();
  const { serviceRequests, clients } = getState();
  if (clientId) return serviceRequests.filter((r) => r.clientId === clientId);
  if (adviserId) {
    const mine = new Set(clients.filter((c) => c.adviserIds.includes(adviserId)).map((c) => c.id));
    return serviceRequests.filter((r) => mine.has(r.clientId));
  }
  return serviceRequests;
}

/** Create a service request and its workflow. Starts after the client's "submitted" step. */
export async function createServiceRequest({ clientId, type, providerId = null, details = {} }) {
  const def = getServiceRequestType(type);
  if (!def) throw new Error(`Unknown request type: ${type}`);
  const workflow = await startWorkflow(def.template, {
    clientId,
    providerId,
    title: def.label,
    startAt: 1,
    actorType: 'client',
    actorName: 'Client',
  });

  const request = { id: uid('req'), clientId, type, workflowId: workflow.id, status: 'in_progress', createdAt: new Date().toISOString(), details };
  if (await useSupabase()) {
    const { data, error } = await supabase
      .from('service_requests')
      .insert({ client_id: clientId, workflow_id: workflow.id, request_type: type, details, status: 'in_progress' })
      .select()
      .single();
    if (error) throw error;
    return { request: { ...request, id: data.id }, workflow };
  }
  setState((s) => ({ ...s, serviceRequests: [request, ...s.serviceRequests] }));
  return { request, workflow };
}
