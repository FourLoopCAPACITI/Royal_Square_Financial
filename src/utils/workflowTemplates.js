/**
 * Workflow templates — the only place where process steps are defined.
 * Every service (claims, life events, service requests, reviews) is just a template.
 * Add a new process by adding a template here; no new engine code is needed.
 *
 * owner: 'client' | 'adviser' | 'provider' | 'repairer' | 'system'
 * dueInDays: how long the owner normally has once the step becomes current.
 */
export const WORKFLOW_TEMPLATES = {
  motor_claim: {
    label: 'Motor claim',
    category: 'claim',
    needsProvider: true,
    steps: [
      { key: 'accident_captured', label: 'Accident captured', owner: 'client', nextAction: 'Capture accident details and evidence', dueInDays: 0 },
      { key: 'claim_submitted', label: 'Claim submitted', owner: 'adviser', nextAction: 'Review evidence and submit claim to insurer', dueInDays: 1 },
      { key: 'claim_number', label: 'Claim number received', owner: 'provider', nextAction: 'Insurer to issue claim number', dueInDays: 2 },
      { key: 'handler_assigned', label: 'Claims handler assigned', owner: 'provider', nextAction: 'Insurer to assign a claims handler', dueInDays: 2 },
      { key: 'vehicle_assessment', label: 'Vehicle assessment', owner: 'adviser', nextAction: 'Schedule vehicle assessment', dueInDays: 1 },
      { key: 'assessment_submitted', label: 'Assessment submitted', owner: 'provider', nextAction: 'Assessor to submit assessment report', dueInDays: 3 },
      { key: 'repair_quotation', label: 'Repair quotation', owner: 'repairer', nextAction: 'Repairer to submit quotation', dueInDays: 3 },
      { key: 'insurer_approval', label: 'Insurer approval', owner: 'provider', nextAction: 'Insurer to approve repair quotation', dueInDays: 3 },
      { key: 'repair_booking', label: 'Repair booking', owner: 'adviser', nextAction: 'Book the vehicle in with the repairer', dueInDays: 2 },
      { key: 'vehicle_repair', label: 'Vehicle repair', owner: 'repairer', nextAction: 'Repair the vehicle', dueInDays: 10 },
      { key: 'car_hire', label: 'Car hire', owner: 'provider', nextAction: 'Arrange car hire while the vehicle is repaired', dueInDays: 1 },
      { key: 'vehicle_return', label: 'Vehicle return', owner: 'repairer', nextAction: 'Return the repaired vehicle to the client', dueInDays: 2 },
      { key: 'claim_closed', label: 'Claim closed', owner: 'adviser', nextAction: 'Confirm client is satisfied and close the claim', dueInDays: 2 },
    ],
  },

  change_of_address: {
    label: 'Change of address',
    category: 'life_event',
    needsProvider: false,
    affects: ['Client profile', 'Personal insurance', 'Vehicle insurance'],
    steps: [
      { key: 'event_reported', label: 'Move reported', owner: 'client', nextAction: 'Tell us your new address', dueInDays: 0 },
      { key: 'proof_of_address', label: 'Proof of address', owner: 'client', nextAction: 'Upload proof of address (not older than 3 months)', dueInDays: 7 },
      { key: 'adviser_review', label: 'Review information', owner: 'adviser', nextAction: 'Review new address and proof of address', dueInDays: 2 },
      { key: 'notify_providers', label: 'Notify affected providers', owner: 'adviser', nextAction: 'Send address update to each affected provider', dueInDays: 2 },
      { key: 'provider_confirmation', label: 'Provider confirmations', owner: 'provider', nextAction: 'Providers to confirm the updated address', dueInDays: 5 },
      { key: 'confirm_completion', label: 'Confirm completion', owner: 'adviser', nextAction: 'Confirm to the client that all records are updated', dueInDays: 1 },
    ],
  },

  policy_amendment: {
    label: 'Policy amendment',
    category: 'service',
    needsProvider: true,
    steps: [
      { key: 'request_received', label: 'Amendment requested', owner: 'client', nextAction: 'Describe the change you need', dueInDays: 0 },
      { key: 'amendment_prepared', label: 'Amendment prepared', owner: 'adviser', nextAction: 'Prepare amendment instruction', dueInDays: 2 },
      { key: 'sent_to_provider', label: 'Sent to provider', owner: 'adviser', nextAction: 'Submit instruction to provider', dueInDays: 1 },
      { key: 'provider_confirmation', label: 'Provider confirmation', owner: 'provider', nextAction: 'Provider confirmation', dueInDays: 5 },
      { key: 'client_notified', label: 'Client notified', owner: 'adviser', nextAction: 'Share updated schedule with client', dueInDays: 1 },
    ],
  },

  annual_review: {
    label: 'Annual review',
    category: 'review',
    needsProvider: false,
    steps: [
      { key: 'review_scheduled', label: 'Review scheduled', owner: 'adviser', nextAction: 'Schedule annual review meeting', dueInDays: 3 },
      { key: 'documents_requested', label: 'Documents requested', owner: 'system', nextAction: 'Send document checklist to client', dueInDays: 0 },
      { key: 'client_documents', label: 'Client documents', owner: 'client', nextAction: 'Upload annual review documents', dueInDays: 7 },
      { key: 'adviser_preparation', label: 'Adviser preparation', owner: 'adviser', nextAction: 'Prepare review pack', dueInDays: 5 },
      { key: 'review_meeting', label: 'Review meeting', owner: 'adviser', nextAction: 'Hold review meeting', dueInDays: 7 },
      { key: 'record_signed', label: 'Record of advice signed', owner: 'client', nextAction: 'Sign record of advice', dueInDays: 5 },
    ],
  },

  bank_details_change: {
    label: 'Change bank details',
    category: 'service',
    needsProvider: false,
    steps: [
      { key: 'request_submitted', label: 'Request submitted', owner: 'client', nextAction: 'Submit new bank details and bank confirmation letter', dueInDays: 0 },
      { key: 'verify_identity', label: 'Verify identity', owner: 'adviser', nextAction: 'Call client to verify the change (fraud check)', dueInDays: 1 },
      { key: 'submit_providers', label: 'Submit to providers', owner: 'adviser', nextAction: 'Send debit-order change to providers', dueInDays: 1 },
      { key: 'provider_confirmation', label: 'Provider confirmation', owner: 'provider', nextAction: 'Providers to confirm new debit order', dueInDays: 5 },
      { key: 'confirm_completion', label: 'Confirm completion', owner: 'adviser', nextAction: 'Confirm completion to client', dueInDays: 1 },
    ],
  },

  document_request: {
    label: 'Document request',
    category: 'service',
    needsProvider: true,
    steps: [
      { key: 'request_submitted', label: 'Request submitted', owner: 'client', nextAction: 'Tell us which document you need', dueInDays: 0 },
      { key: 'request_to_provider', label: 'Requested from provider', owner: 'adviser', nextAction: 'Request document from provider', dueInDays: 1 },
      { key: 'provider_issues', label: 'Provider issues document', owner: 'provider', nextAction: 'Provider to issue document', dueInDays: 3 },
      { key: 'shared_with_client', label: 'Shared with you', owner: 'adviser', nextAction: 'Upload document to client portal', dueInDays: 1 },
    ],
  },

  consultation_request: {
    label: 'Consultation',
    category: 'service',
    needsProvider: false,
    steps: [
      { key: 'request_submitted', label: 'Request submitted', owner: 'client', nextAction: 'Tell us what you want to discuss', dueInDays: 0 },
      { key: 'schedule_meeting', label: 'Meeting scheduled', owner: 'adviser', nextAction: 'Propose meeting times', dueInDays: 2 },
      { key: 'meeting_held', label: 'Meeting held', owner: 'adviser', nextAction: 'Hold consultation', dueInDays: 7 },
    ],
  },

  financial_info_submission: {
    label: 'Financial information',
    category: 'service',
    needsProvider: false,
    steps: [
      { key: 'info_submitted', label: 'Information submitted', owner: 'client', nextAction: 'Submit financial information', dueInDays: 0 },
      { key: 'adviser_review', label: 'Adviser review', owner: 'adviser', nextAction: 'Review submitted information', dueInDays: 3 },
      { key: 'records_updated', label: 'Records updated', owner: 'system', nextAction: 'Update client financial record', dueInDays: 0 },
    ],
  },
};

/**
 * Client Service Centre catalogue. Each request maps onto a template above,
 * so every request uses the same workflow engine.
 */
export const SERVICE_REQUEST_TYPES = [
  { type: 'change_of_address', template: 'change_of_address', label: 'Change of address', description: 'Update your address across your policies.', icon: 'Home' },
  { type: 'bank_details_change', template: 'bank_details_change', label: 'Change bank details', description: 'Update the account your debit orders come from.', icon: 'Landmark' },
  { type: 'policy_document', template: 'document_request', label: 'Request policy document', description: 'Get a copy of a policy schedule or contract.', icon: 'FileText', askProvider: true },
  { type: 'border_letter', template: 'document_request', label: 'Request border letter', description: 'Get the letter you need to take your vehicle across the border.', icon: 'Car', askProvider: true },
  { type: 'irp5_request', template: 'document_request', label: 'Request IRP5 / tax certificate', description: 'Get tax certificates for your SARS return.', icon: 'Receipt', askProvider: true },
  { type: 'consultation', template: 'consultation_request', label: 'Request consultation', description: 'Book time with your adviser.', icon: 'CalendarDays' },
  { type: 'financial_info', template: 'financial_info_submission', label: 'Submit financial information', description: 'Send updated income, assets or liabilities.', icon: 'ClipboardList' },
];

export function getTemplate(type) {
  const template = WORKFLOW_TEMPLATES[type];
  if (!template) throw new Error(`Unknown workflow type: ${type}`);
  return template;
}

export function getServiceRequestType(type) {
  return SERVICE_REQUEST_TYPES.find((r) => r.type === type) || null;
}
