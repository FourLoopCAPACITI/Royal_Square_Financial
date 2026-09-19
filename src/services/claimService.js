/** Claims: listing, and turning an Accident Assist report into a claim workflow. */
import { supabase } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, setState, simulateLatency } from './store.js';
import { saveNewWorkflow } from './workflowService.js';
import { createWorkflow, createActivityEvent } from '../utils/workflow.js';
import { getEvidenceChecklist } from '../utils/claims.js';
import { uid, daysFromNow } from '../utils/format.js';

function mapClaim(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    workflowId: row.workflow_id,
    providerId: row.provider_id,
    claimNumber: row.claim_number,
    type: row.claim_type,
    incidentAt: row.incident_at,
    location: row.incident_location,
    description: row.description,
    evidence: (row.claim_evidence || []).map((e) => ({ id: e.id, type: e.evidence_type, label: e.notes || e.evidence_type, captured: e.captured ?? true })),
    createdAt: row.created_at,
  };
}

export async function listClaims({ clientId, adviserId } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('claims').select('*, claim_evidence(*)').order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapClaim);
  }
  await simulateLatency();
  const { claims, clients } = getState();
  if (clientId) return claims.filter((c) => c.clientId === clientId);
  if (adviserId) {
    const mine = new Set(clients.filter((c) => c.adviserIds.includes(adviserId)).map((c) => c.id));
    return claims.filter((c) => mine.has(c.clientId));
  }
  return claims;
}

export async function getClaimByWorkflow(workflowId) {
  if (await useSupabase()) {
    const { data, error } = await supabase.from('claims').select('*, claim_evidence(*)').eq('workflow_id', workflowId).maybeSingle();
    if (error) throw error;
    return data ? mapClaim(data) : null;
  }
  await simulateLatency(60);
  return getState().claims.find((c) => c.workflowId === workflowId) || null;
}

/** The client's vehicle insurer, falling back to Santam in the demo. */
function findVehicleInsurer(clientId) {
  const product = getState().clientProducts.find((p) => p.clientId === clientId && p.type === 'Vehicle insurance');
  return product?.providerId || 'p1';
}

/**
 * Accident report → claim + motor claim workflow (starts at "Claim submitted", owned by the adviser).
 * Used directly when online and by syncService when a queued offline report is uploaded.
 */
export async function createClaimFromReport(report) {
  const now = new Date();
  const clientId = report.clientId;
  const client = getState().clients.find((c) => c.id === clientId);
  const providerId = report.providerId || findVehicleInsurer(clientId);

  const { workflow } = createWorkflow('motor_claim', { clientId, providerId, title: 'Motor claim', priority: 'high', startAt: 1, now });
  workflow.steps[0].startedAt = report.startedAt || now.toISOString();
  workflow.steps[0].completedAt = report.savedOfflineAt || now.toISOString();

  const checklist = getEvidenceChecklist(report);
  const events = [
    createActivityEvent(workflow, {
      actorType: 'client',
      actorName: client?.name || 'Client',
      message: report.capturedOffline ? 'Accident evidence captured offline and synced' : 'Client submitted accident evidence',
      now,
    }),
    createActivityEvent(workflow, {
      actorType: 'system',
      actorName: 'System',
      message: `Evidence checklist ${checklist.completed}/${checklist.total} complete. Adviser notified`,
      now: new Date(now.getTime() + 1000),
    }),
  ];

  const saved = await saveNewWorkflow(workflow, events);

  const claim = {
    id: uid('claim'),
    clientId,
    workflowId: saved.id,
    providerId,
    claimNumber: null,
    type: 'motor',
    incidentAt: report.startedAt || now.toISOString(),
    location: report.location?.address || 'Location not captured',
    coordinates: report.location ? { lat: report.location.lat, lng: report.location.lng } : null,
    description: report.description || 'No description provided',
    vehicle: report.registration?.own || client?.vehicle || '',
    otherParty: { name: report.otherDriver?.name, registration: report.registration?.other, insurer: report.insurance?.otherInsurer || 'Unknown', phone: report.otherDriver?.phone },
    witnesses: report.witnesses || [],
    evidence: checklist.items.map((i) => ({ id: uid('ev'), type: i.key, label: i.label, captured: i.done })),
    capturedOffline: Boolean(report.capturedOffline),
    createdAt: now.toISOString(),
  };

  if (await useSupabase()) {
    const { data, error } = await supabase
      .from('claims')
      .insert({
        client_id: clientId,
        workflow_id: saved.id,
        provider_id: providerId,
        claim_type: 'motor',
        incident_at: claim.incidentAt,
        incident_location: claim.location,
        latitude: claim.coordinates?.lat,
        longitude: claim.coordinates?.lng,
        description: claim.description,
        status: 'submitted',
      })
      .select()
      .single();
    if (error) throw error;
    const evidenceRows = checklist.items.filter((i) => i.done).map((i) => ({ claim_id: data.id, evidence_type: i.key, notes: i.label, captured_offline: Boolean(report.capturedOffline) }));
    if (evidenceRows.length) await supabase.from('claim_evidence').insert(evidenceRows);
    return { workflow: saved, claim: { ...claim, id: data.id } };
  }

  const adviserTask = {
    id: uid('task'),
    clientId,
    workflowId: saved.id,
    taskKey: 'review_accident',
    assignee: 'adviser',
    adviserId: client?.adviserIds?.[0],
    kind: 'task',
    title: 'Review accident report and submit claim',
    description: `${client?.name || 'Client'} · ${checklist.completed}/${checklist.total} evidence items`,
    dueDate: daysFromNow(0, 17),
    status: 'open',
    priority: 'high',
  };
  setState((s) => ({ ...s, claims: [claim, ...s.claims], tasks: [adviserTask, ...s.tasks] }));
  return { workflow: saved, claim };
}

/** Demo stand-in for a provider response: when the insurer "issues" a claim number. */
export async function assignClaimNumberIfNeeded(workflowId, completedStepKey) {
  if (completedStepKey !== 'claim_number') return;
  const claimNumber = `SAN-CLM-DEMO-${Math.floor(10000 + Math.random() * 89999)}`;
  if (await useSupabase()) {
    await supabase.from('claims').update({ claim_number: claimNumber }).eq('workflow_id', workflowId).is('claim_number', null);
    return;
  }
  setState((s) => ({ ...s, claims: s.claims.map((c) => (c.workflowId === workflowId && !c.claimNumber ? { ...c, claimNumber } : c)) }));
}
