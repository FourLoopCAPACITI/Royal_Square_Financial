/**
 * Fictional South African demo data. No real people, ID numbers or policies.
 * Provider behaviour in this app is MOCK ONLY — there are no live provider integrations.
 *
 * Dates are generated relative to "now" so the demo always shows
 * sensible due dates ("Due today", "expires in 54 days").
 * Call createInitialState() to get a fresh copy.
 */
import { WORKFLOW_TEMPLATES } from '../utils/workflowTemplates.js';
import { daysFromNow } from '../utils/format.js';

/** Build template steps with the given step already current. */
function buildSteps(type, currentIndex, stepTimes = {}) {
  return WORKFLOW_TEMPLATES[type].steps.map((def, i) => ({
    id: `${type}_${i}`,
    key: def.key,
    label: def.label,
    owner: def.owner,
    nextAction: def.nextAction,
    dueInDays: def.dueInDays,
    status: i < currentIndex ? 'complete' : i === currentIndex ? 'current' : 'upcoming',
    startedAt: i <= currentIndex ? stepTimes[i] || stepTimes.default || null : null,
    completedAt: i < currentIndex ? stepTimes[i + 1] || stepTimes[i] || stepTimes.default || null : null,
  }));
}

function workflow({ id, clientId, type, providerId = null, title, currentIndex, dueDate, priority = 'normal', createdAt, stepTimes }) {
  const steps = buildSteps(type, currentIndex, { default: createdAt, ...stepTimes }).map((s) => ({ ...s, id: `${id}_s${s.id.split('_').pop()}` }));
  const current = steps[currentIndex];
  return {
    id,
    clientId,
    type,
    title: title || WORKFLOW_TEMPLATES[type].label,
    providerId,
    status: 'active',
    currentOwner: current.owner,
    currentStep: currentIndex,
    nextAction: current.nextAction,
    dueDate,
    priority,
    createdAt,
    updatedAt: stepTimes?.[currentIndex] || createdAt,
    steps,
  };
}

export function createInitialState() {
  // Yesterday's accident timeline (times match the activity timeline).
  const t = (h, m) => daysFromNow(-1, h, m);

  const advisers = [
    { id: 'a1', name: 'Sipho Ndlovu', email: 'sipho.ndlovu@royalsquare.demo', phone: '021 555 0101', region: 'Cape Town', fspRepNumber: 'REP-DEMO-1042' },
    { id: 'a2', name: 'Michelle van der Merwe', email: 'michelle.vdm@royalsquare.demo', phone: '021 555 0102', region: 'Stellenbosch', fspRepNumber: 'REP-DEMO-1077' },
  ];

  const providers = [
    { id: 'p1', name: 'Santam', category: 'Short-term insurance', contact: 'claims@santam.demo', avgResponseDays: 2, integration: 'mock' },
    { id: 'p2', name: 'Discovery', category: 'Life and health insurance', contact: 'service@discovery.demo', avgResponseDays: 4, integration: 'mock' },
    { id: 'p3', name: 'Sanlam', category: 'Life insurance and retirement', contact: 'service@sanlam.demo', avgResponseDays: 3, integration: 'mock' },
    { id: 'p4', name: 'Momentum', category: 'Investments and life insurance', contact: 'service@momentum.demo', avgResponseDays: 3, integration: 'mock' },
    { id: 'p5', name: 'Allan Gray', category: 'Investments', contact: 'service@allangray.demo', avgResponseDays: 2, integration: 'mock' },
  ];

  const clients = [
    {
      id: 'c1', firstName: 'Lerato', lastName: 'Molefe', email: 'lerato.molefe@example.demo', phone: '082 555 0141',
      idNumberMasked: '900312 **** ***', dateOfBirth: '1990-03-12', address: '14 Protea Road, Rondebosch', city: 'Cape Town', postalCode: '7700',
      occupation: 'Pharmacist', adviserIds: ['a1'], householdId: 'h1', totalAssets: 1530000, totalLiabilities: 290000,
      vehicle: '2021 Toyota Corolla Cross · CA 123-456',
    },
    {
      id: 'c2', firstName: 'Thandi', lastName: 'Jacobs', email: 'thandi.jacobs@example.demo', phone: '083 555 0199',
      idNumberMasked: '850721 **** ***', dateOfBirth: '1985-07-21', address: '7 Harbour View, Gordon\'s Bay', city: 'Cape Town', postalCode: '7140',
      occupation: 'Civil engineer', adviserIds: ['a1'], householdId: null, totalAssets: 2380000, totalLiabilities: 910000,
    },
    {
      id: 'c3', firstName: 'Johan', lastName: 'Pretorius', email: 'johan.p@example.demo', phone: '072 555 0133',
      idNumberMasked: '680904 **** ***', dateOfBirth: '1968-09-04', address: '22 Dennesig Street', city: 'Stellenbosch', postalCode: '7600',
      occupation: 'Wine farm manager', adviserIds: ['a2'], householdId: null, totalAssets: 5120000, totalLiabilities: 640000,
    },
    {
      id: 'c4', firstName: 'Ayesha', lastName: 'Patel', email: 'ayesha.patel@example.demo', phone: '084 555 0177',
      idNumberMasked: '930115 **** ***', dateOfBirth: '1993-01-15', address: '3 Kloof Nek Road, Tamboerskloof', city: 'Cape Town', postalCode: '8001',
      occupation: 'Software developer', adviserIds: ['a1'], householdId: null, totalAssets: 780000, totalLiabilities: 215000,
    },
    {
      id: 'c5', firstName: 'Bongani', lastName: 'Dlamini', email: 'bongani.d@example.demo', phone: '076 555 0112',
      idNumberMasked: '890630 **** ***', dateOfBirth: '1989-06-30', address: '14 Protea Road, Rondebosch', city: 'Cape Town', postalCode: '7700',
      occupation: 'Teacher', adviserIds: ['a2'], householdId: 'h1', totalAssets: 640000, totalLiabilities: 120000,
    },
  ].map((c) => ({ ...c, name: `${c.firstName} ${c.lastName}` }));

  const households = [{ id: 'h1', name: 'Molefe–Dlamini household', memberIds: ['c1', 'c5'] }];

  const clientProducts = [
    { id: 'pr1', clientId: 'c1', providerId: 'p1', type: 'Vehicle insurance', policyNumber: 'SAN-DEMO-44821', description: 'Comprehensive motor cover' },
    { id: 'pr2', clientId: 'c1', providerId: 'p1', type: 'Personal insurance', policyNumber: 'SAN-DEMO-44822', description: 'Home contents' },
    { id: 'pr3', clientId: 'c1', providerId: 'p3', type: 'Life cover', policyNumber: 'SLM-DEMO-90311', description: 'Life and disability cover' },
    { id: 'pr4', clientId: 'c1', providerId: 'p5', type: 'Investment', policyNumber: 'AG-DEMO-22007', description: 'Tax-free savings account' },
    { id: 'pr5', clientId: 'c2', providerId: 'p2', type: 'Life cover', policyNumber: 'DSC-DEMO-55120', description: 'Life plan' },
    { id: 'pr6', clientId: 'c3', providerId: 'p4', type: 'Retirement annuity', policyNumber: 'MOM-DEMO-70014', description: 'Retirement annuity' },
    { id: 'pr7', clientId: 'c4', providerId: 'p1', type: 'Vehicle insurance', policyNumber: 'SAN-DEMO-45990', description: 'Comprehensive motor cover' },
    { id: 'pr8', clientId: 'c5', providerId: 'p3', type: 'Life cover', policyNumber: 'SLM-DEMO-90877', description: 'Funeral and life cover' },
  ];

  const goals = [
    { id: 'g1', name: 'Home Deposit', ownerType: 'household', householdId: 'h1', clientId: null, currentAmount: 186000, targetAmount: 300000, targetDate: daysFromNow(420), category: 'Property' },
    { id: 'g2', name: 'Emergency Fund', ownerType: 'client', clientId: 'c1', householdId: null, currentAmount: 42000, targetAmount: 50000, targetDate: daysFromNow(120), category: 'Safety net' },
    { id: 'g3', name: 'Retirement top-up', ownerType: 'client', clientId: 'c3', householdId: null, currentAmount: 1250000, targetAmount: 2000000, targetDate: daysFromNow(2200), category: 'Retirement' },
    { id: 'g4', name: "Children's education", ownerType: 'client', clientId: 'c2', householdId: null, currentAmount: 96000, targetAmount: 400000, targetDate: daysFromNow(3000), category: 'Education' },
    { id: 'g5', name: 'Vehicle replacement', ownerType: 'client', clientId: 'c4', householdId: null, currentAmount: 38000, targetAmount: 120000, targetDate: daysFromNow(600), category: 'Vehicle' },
  ];

  const workflows = [
    workflow({
      id: 'w1', clientId: 'c1', type: 'motor_claim', providerId: 'p1', title: 'Motor claim', currentIndex: 4,
      dueDate: daysFromNow(0, 17), priority: 'high', createdAt: t(10, 14),
      stepTimes: { 0: t(10, 14), 1: t(10, 42), 2: t(11, 6), 3: t(11, 49), 4: t(12, 3) },
    }),
    workflow({
      id: 'w2', clientId: 'c2', type: 'policy_amendment', providerId: 'p2', title: 'Policy amendment', currentIndex: 3,
      dueDate: daysFromNow(2, 17), createdAt: daysFromNow(-8, 9),
      stepTimes: { 1: daysFromNow(-6, 10), 2: daysFromNow(-4, 11), 3: daysFromNow(-3, 9, 30) },
    }),
    workflow({
      id: 'w3', clientId: 'c1', type: 'annual_review', title: 'Annual review', currentIndex: 2,
      dueDate: daysFromNow(7, 17), createdAt: daysFromNow(-5, 9),
      stepTimes: { 1: daysFromNow(-4, 9), 2: daysFromNow(-4, 9, 5) },
    }),
    workflow({
      id: 'w4', clientId: 'c3', type: 'change_of_address', title: 'Change of address', currentIndex: 1,
      dueDate: daysFromNow(-3, 17), createdAt: daysFromNow(-10, 14),
      stepTimes: { 1: daysFromNow(-10, 14, 5) },
    }),
    workflow({
      id: 'w5', clientId: 'c1', type: 'policy_amendment', providerId: 'p3', title: 'Policy amendment', currentIndex: 3,
      dueDate: daysFromNow(3, 17), createdAt: daysFromNow(-6, 11),
      stepTimes: { 1: daysFromNow(-5, 9), 2: daysFromNow(-3, 15), 3: daysFromNow(-2, 10) },
    }),
    workflow({
      id: 'w6', clientId: 'c4', type: 'bank_details_change', title: 'Change bank details', currentIndex: 1, priority: 'high',
      dueDate: daysFromNow(-2, 17), createdAt: daysFromNow(-4, 16),
      stepTimes: { 1: daysFromNow(-4, 16, 10) },
    }),
    workflow({
      id: 'w7', clientId: 'c2', type: 'document_request', providerId: 'p2', title: 'IRP5 / tax certificate', currentIndex: 1,
      dueDate: daysFromNow(1, 17), createdAt: daysFromNow(-1, 15),
      stepTimes: { 1: daysFromNow(-1, 15, 2) },
    }),
  ];

  const claims = [
    {
      id: 'cl1', clientId: 'c1', workflowId: 'w1', providerId: 'p1', claimNumber: 'SAN-CLM-DEMO-78213', type: 'motor',
      incidentAt: t(9, 52), location: 'Main Road & Belmont Road, Rondebosch', coordinates: { lat: -33.9611, lng: 18.4721 },
      description: 'Rear-ended at a red traffic light. No injuries. Rear bumper and boot damaged.',
      vehicle: '2021 Toyota Corolla Cross · CA 123-456',
      otherParty: { name: 'Pieter Smit', registration: 'CA 987-654', insurer: 'Unknown', phone: '071 555 0190' },
      witnesses: [{ name: 'Nomsa Khumalo', phone: '079 555 0150' }],
      evidence: [
        { id: 'ev1', type: 'location', label: 'Accident location', captured: true },
        { id: 'ev2', type: 'scene_photos', label: 'Scene photographs', captured: true, count: 4 },
        { id: 'ev3', type: 'other_vehicle', label: 'Other vehicle', captured: true },
        { id: 'ev4', type: 'other_insurer', label: 'Other insurer', captured: false },
        { id: 'ev5', type: 'witness', label: 'Witness', captured: true },
        { id: 'ev6', type: 'voice_note', label: 'Voice description', captured: false },
      ],
      carHire: 'Not yet arranged',
      createdAt: t(10, 14),
    },
  ];

  const activityEvents = [
    { id: 'e1', workflowId: 'w1', clientId: 'c1', at: t(10, 14), actorType: 'client', actorName: 'Lerato Molefe', message: 'Client submitted accident evidence' },
    { id: 'e2', workflowId: 'w1', clientId: 'c1', at: t(10, 42), actorType: 'adviser', actorName: 'Sipho Ndlovu', message: 'Adviser reviewed submission' },
    { id: 'e3', workflowId: 'w1', clientId: 'c1', at: t(11, 6), actorType: 'adviser', actorName: 'Sipho Ndlovu', message: 'Claim submitted to Santam' },
    { id: 'e4', workflowId: 'w1', clientId: 'c1', at: t(11, 49), actorType: 'provider', actorName: 'Santam', message: 'Santam claim number received' },
    { id: 'e5', workflowId: 'w1', clientId: 'c1', at: t(12, 3), actorType: 'system', actorName: 'System', message: 'Vehicle assessment requested' },
    { id: 'e6', workflowId: 'w2', clientId: 'c2', at: daysFromNow(-3, 9, 30), actorType: 'adviser', actorName: 'Sipho Ndlovu', message: 'Amendment instruction sent to Discovery' },
    { id: 'e7', workflowId: 'w3', clientId: 'c1', at: daysFromNow(-4, 9, 5), actorType: 'system', actorName: 'System', message: 'Annual review document checklist sent' },
    { id: 'e8', workflowId: 'w4', clientId: 'c3', at: daysFromNow(-10, 14, 5), actorType: 'client', actorName: 'Johan Pretorius', message: 'Client reported a move' },
    { id: 'e9', workflowId: 'w5', clientId: 'c1', at: daysFromNow(-2, 10), actorType: 'adviser', actorName: 'Sipho Ndlovu', message: 'Beneficiary change sent to Sanlam' },
    { id: 'e10', workflowId: 'w6', clientId: 'c4', at: daysFromNow(-4, 16, 10), actorType: 'client', actorName: 'Ayesha Patel', message: 'Client requested bank details change' },
  ];

  const tasks = [
    { id: 't1', clientId: 'c1', workflowId: null, taskKey: 'licence_renewal', assignee: 'client', kind: 'reminder', title: "Driver's licence expires in 54 days", description: 'Renew at your licensing centre, then upload the new card.', dueDate: daysFromNow(54), status: 'open', priority: 'normal', link: '/client/documents' },
    { id: 't2', clientId: 'c1', workflowId: 'w3', taskKey: 'annual_review_docs', assignee: 'client', kind: 'task', title: 'Annual review document outstanding', description: 'Upload your latest proof of income.', dueDate: daysFromNow(7), status: 'open', priority: 'normal', link: '/client/documents' },
    { id: 't3', clientId: 'c1', workflowId: null, taskKey: 'confirm_policy_info', assignee: 'client', kind: 'task', title: 'Policy information requires confirmation', description: 'Confirm the regular driver and overnight parking on your vehicle policy.', dueDate: daysFromNow(5), status: 'open', priority: 'normal', link: '/client/profile' },
    { id: 't4', clientId: 'c1', workflowId: 'w1', taskKey: 'schedule_assessment', assignee: 'adviser', adviserId: 'a1', kind: 'task', title: 'Schedule vehicle assessment', description: 'Book Santam assessor for Lerato Molefe.', dueDate: daysFromNow(0, 17), status: 'open', priority: 'high' },
    { id: 't5', clientId: 'c2', workflowId: 'w2', taskKey: 'follow_up_provider', assignee: 'adviser', adviserId: 'a1', kind: 'task', title: 'Follow up with Discovery', description: 'Chase confirmation of policy amendment.', dueDate: daysFromNow(1), status: 'open', priority: 'normal' },
    { id: 't6', clientId: 'c4', workflowId: 'w6', taskKey: 'verify_bank_change', assignee: 'adviser', adviserId: 'a1', kind: 'task', title: 'Verify bank details change by phone', description: 'Fraud check before submitting to providers.', dueDate: daysFromNow(-2), status: 'open', priority: 'high' },
    { id: 't7', clientId: 'c3', workflowId: 'w4', taskKey: 'proof_of_address', assignee: 'client', kind: 'task', title: 'Upload proof of address', description: 'Needed to complete your change of address.', dueDate: daysFromNow(-3), status: 'open', priority: 'normal' },
    { id: 't8', clientId: 'c5', workflowId: null, taskKey: 'annual_review_due', assignee: 'adviser', adviserId: 'a2', kind: 'reminder', title: 'Annual review due next month', description: 'Schedule Bongani Dlamini annual review.', dueDate: daysFromNow(30), status: 'open', priority: 'low' },
  ];

  const reminders = [
    { id: 'r1', clientId: 'c1', documentId: 'd2', title: "Driver's licence renewal", remindAt: daysFromNow(-6), channel: 'email' },
  ];

  const documents = [
    { id: 'd1', clientId: 'c1', type: 'id_document', name: 'ID document', status: 'current', uploadedAt: daysFromNow(-400), expiryDate: null },
    { id: 'd2', clientId: 'c1', type: 'drivers_licence', name: "Driver's licence", status: 'current', uploadedAt: daysFromNow(-1500), expiryDate: daysFromNow(54) },
    { id: 'd3', clientId: 'c1', type: 'policy_schedule', name: 'Santam vehicle policy schedule', status: 'current', uploadedAt: daysFromNow(-90), expiryDate: null },
    { id: 'd4', clientId: 'c1', type: 'income_statement', name: 'Proof of income', status: 'missing', uploadedAt: null, expiryDate: null, workflowId: 'w3' },
    { id: 'd5', clientId: 'c1', type: 'investment_statement', name: 'Allan Gray TFSA statement', status: 'under_review', uploadedAt: daysFromNow(-2), expiryDate: null },
    { id: 'd6', clientId: 'c1', type: 'valuation_certificate', name: 'Jewellery valuation certificate', status: 'current', uploadedAt: daysFromNow(-800), expiryDate: daysFromNow(-20) },
    { id: 'd7', clientId: 'c3', type: 'proof_of_address', name: 'Proof of address', status: 'missing', uploadedAt: null, expiryDate: null, workflowId: 'w4' },
    { id: 'd8', clientId: 'c2', type: 'policy_schedule', name: 'Discovery life plan schedule', status: 'current', uploadedAt: daysFromNow(-200), expiryDate: null },
    { id: 'd9', clientId: 'c4', type: 'drivers_licence', name: "Driver's licence", status: 'current', uploadedAt: daysFromNow(-300), expiryDate: daysFromNow(700) },
  ];

  const serviceRequests = [
    { id: 'sr1', clientId: 'c4', type: 'bank_details_change', workflowId: 'w6', status: 'in_progress', createdAt: daysFromNow(-4, 16), details: { note: 'New account at Capitec' } },
    { id: 'sr2', clientId: 'c2', type: 'irp5_request', workflowId: 'w7', status: 'in_progress', createdAt: daysFromNow(-1, 15), details: { providerId: 'p2', taxYear: '2026' } },
  ];

  return {
    version: 1,
    advisers,
    providers,
    clients,
    households,
    clientProducts,
    goals,
    workflows,
    claims,
    activityEvents,
    tasks,
    reminders,
    documents,
    serviceRequests,
  };
}

/** Demo identities used by the Client / Adviser view switch. */
export const DEMO_CLIENT_ID = 'c1';
export const DEMO_ADVISER_ID = 'a1';
