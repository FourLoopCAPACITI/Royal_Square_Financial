/** Convert Supabase snake_case rows into the camelCase shapes the UI uses. */
export function mapClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    phone: row.phone,
    idNumberMasked: row.id_number_masked,
    dateOfBirth: row.date_of_birth,
    address: row.address_line,
    city: row.city,
    postalCode: row.postal_code,
    occupation: row.occupation,
    totalAssets: Number(row.total_assets || 0),
    totalLiabilities: Number(row.total_liabilities || 0),
    adviserIds: (row.client_adviser_assignments || []).map((a) => a.adviser_id),
    householdId: row.household_members?.[0]?.household_id || null,
  };
}

export function mapStep(row) {
  return {
    id: row.id,
    key: row.step_key,
    label: row.label,
    owner: row.owner,
    status: row.status,
    nextAction: row.next_action,
    dueInDays: row.due_in_days,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export function mapWorkflow(row) {
  if (!row) return null;
  const steps = (row.workflow_steps || []).sort((a, b) => a.position - b.position).map(mapStep);
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type,
    title: row.title,
    providerId: row.provider_id,
    status: row.status,
    currentOwner: row.current_owner,
    currentStep: row.current_step,
    nextAction: row.next_action,
    dueDate: row.due_date,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps,
  };
}

export function workflowToRow(w) {
  return {
    client_id: w.clientId,
    type: w.type,
    title: w.title,
    provider_id: w.providerId,
    status: w.status,
    current_owner: w.currentOwner,
    current_step: w.currentStep,
    next_action: w.nextAction,
    due_date: w.dueDate,
    priority: w.priority,
  };
}

export function stepToRow(step, workflowId, position) {
  return {
    workflow_id: workflowId,
    position,
    step_key: step.key,
    label: step.label,
    owner: step.owner,
    status: step.status,
    next_action: step.nextAction,
    due_in_days: step.dueInDays,
    started_at: step.startedAt,
    completed_at: step.completedAt,
  };
}

export function mapEvent(row) {
  return {
    id: row.id,
    workflowId: row.workflow_id,
    clientId: row.client_id,
    at: row.occurred_at,
    actorType: row.actor_type,
    actorName: row.actor_name,
    message: row.message,
  };
}

export function mapDocument(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    workflowId: row.workflow_id,
    type: row.doc_type,
    name: row.name,
    status: row.status,
    uploadedAt: row.uploaded_at,
    updatedAt: row.updated_at,
    expiryDate: row.expiry_date,
    storagePath: row.storage_path,
  };
}

export function mapGoal(row) {
  return {
    id: row.id,
    name: row.name,
    ownerType: row.household_id ? 'household' : 'client',
    clientId: row.client_id,
    householdId: row.household_id,
    currentAmount: Number(row.current_amount),
    targetAmount: Number(row.target_amount),
    targetDate: row.target_date,
    category: row.category,
  };
}

export function mapTask(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    workflowId: row.workflow_id,
    taskKey: row.task_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignee: row.assignee_role,
    adviserId: row.assigned_adviser_id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    priority: row.priority,
  };
}

export function mapProvider(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    contact: row.contact_email,
    avgResponseDays: row.avg_response_days,
    integration: row.integration_mode,
  };
}
