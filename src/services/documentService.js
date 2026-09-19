/**
 * Smart documents: listing and the simulated intelligent upload.
 * One upload can update the client record, create reminders, close tasks
 * and move a workflow forward — the "admin disappears" moment of the demo.
 */
import { supabase, STORAGE_BUCKETS, clientDocumentPath } from './supabase.js';
import { useSupabase } from './dataSource.js';
import { getState, setState, simulateLatency } from './store.js';
import { mapDocument } from './mappers.js';
import { extractDocumentData } from './documentIntelligence.js';
import { advance } from './workflowService.js';
import { computeDocumentStatus, getDocumentTypeLabel, EXPIRY_WARNING_DAYS } from '../utils/documents.js';
import { formatDate, uid } from '../utils/format.js';

export async function listDocuments({ clientId, adviserId } = {}) {
  if (await useSupabase()) {
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (clientId) query = query.eq('client_id', clientId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map((row) => {
      const doc = mapDocument(row);
      return { ...doc, status: computeDocumentStatus(doc) };
    });
  }
  await simulateLatency();
  const { documents, clients } = getState();
  let list = documents;
  if (clientId) list = list.filter((d) => d.clientId === clientId);
  if (adviserId) {
    const mine = new Set(clients.filter((c) => c.adviserIds.includes(adviserId)).map((c) => c.id));
    list = list.filter((d) => mine.has(d.clientId));
  }
  return list.map((d) => ({ ...d, status: computeDocumentStatus(d) }));
}

/** Folder inside client-documents/{client_id}/ */
function folderFor(type) {
  return { drivers_licence: 'licences', policy_schedule: 'policies', proof_of_address: 'address', id_document: 'identity' }[type] || 'general';
}

/**
 * Upload + process a document.
 * Returns { document, outcome: { headline, detected: [{label, value}], actions: [string] } }
 */
export async function uploadAndProcessDocument({ clientId, type, file }) {
  const label = getDocumentTypeLabel(type);
  const fileName = file?.name || `${type}.pdf`;
  let storagePath = null;

  if (await useSupabase()) {
    if (file) {
      storagePath = clientDocumentPath(clientId, folderFor(type), fileName);
      const { error } = await supabase.storage.from(STORAGE_BUCKETS.clientDocuments).upload(storagePath, file);
      if (error) throw error;
    }
  }

  const extracted = await extractDocumentData(file, type);
  const actions = [];
  const detected = [];
  const now = new Date().toISOString();
  const expiryDate = extracted.fields.expiryDate ? new Date(`${extracted.fields.expiryDate}T09:00:00`).toISOString() : null;

  const document = {
    id: uid('doc'),
    clientId,
    type,
    name: label,
    status: type === 'drivers_licence' ? 'current' : 'under_review',
    uploadedAt: now,
    expiryDate,
    storagePath,
  };

  if (expiryDate) detected.push({ label: 'Expiry date detected', value: formatDate(expiryDate) });

  if (await useSupabase()) {
    const { data, error } = await supabase
      .from('documents')
      .insert({ client_id: clientId, doc_type: type, name: label, status: document.status, storage_path: storagePath, expiry_date: expiryDate, extracted_data: extracted.fields, uploaded_at: now })
      .select()
      .single();
    if (error) throw error;
    document.id = data.id;
    actions.push('Client record updated');
    return { document, outcome: { headline: `${label} uploaded`, detected, actions } };
  }

  // ── Mock mode: apply the knock-on effects ────────────────
  const state = getState();
  const replaced = state.documents.find((d) => d.clientId === clientId && d.type === type);
  let documents = replaced
    ? state.documents.map((d) => (d.id === replaced.id ? { ...document, id: replaced.id, workflowId: replaced.workflowId } : d))
    : [document, ...state.documents];
  if (replaced) document.id = replaced.id;
  actions.push('Client record updated');

  let reminders = state.reminders;
  let tasks = state.tasks;

  if (type === 'drivers_licence' && expiryDate) {
    const remindAt = new Date(expiryDate);
    remindAt.setDate(remindAt.getDate() - EXPIRY_WARNING_DAYS);
    reminders = [
      { id: uid('rem'), clientId, documentId: document.id, title: "Driver's licence renewal", remindAt: remindAt.toISOString(), channel: 'email' },
      ...reminders.filter((r) => !(r.clientId === clientId && r.title === "Driver's licence renewal")),
    ];
    actions.push(`${EXPIRY_WARNING_DAYS}-day reminder created`);
    const licenceTask = tasks.find((t) => t.clientId === clientId && t.taskKey === 'licence_renewal' && t.status === 'open');
    if (licenceTask) {
      tasks = tasks.map((t) => (t.id === licenceTask.id ? { ...t, status: 'done' } : t));
      actions.push('Outstanding licence task closed');
    }
  }

  setState((s) => ({ ...s, documents, reminders, tasks }));

  // Documents that a workflow is waiting for move that workflow forward.
  const waitingWorkflow = getState().workflows.find(
    (w) =>
      w.clientId === clientId &&
      w.status === 'active' &&
      w.currentOwner === 'client' &&
      ((type === 'proof_of_address' && w.type === 'change_of_address') || (type === 'income_statement' && w.type === 'annual_review')),
  );
  if (waitingWorkflow) {
    await advance(waitingWorkflow.id, { actorType: 'client', actorName: 'Client', note: `${label} uploaded` });
    actions.push(`${waitingWorkflow.title} moved to Royal Square for review`);
  }

  if (type === 'income_statement') {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.clientId === clientId && t.taskKey === 'annual_review_docs' ? { ...t, status: 'done' } : t)) }));
    if (!actions.some((a) => a.includes('Annual review'))) actions.push('Annual review document task closed');
  }

  return { document, outcome: { headline: `${label} uploaded`, detected, actions } };
}
