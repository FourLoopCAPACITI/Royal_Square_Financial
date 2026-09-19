/**
 * Life Events: one event → several admin actions → one coordinated workflow.
 * "I moved" is fully implemented; add the others by pointing them at a template.
 */
import { startWorkflow } from './workflowService.js';
import { getState, setState } from './store.js';
import { useSupabase } from './dataSource.js';
import { getTemplate } from '../utils/workflowTemplates.js';
import { uid } from '../utils/format.js';

export const LIFE_EVENTS = [
  { key: 'moved', label: 'I moved', description: 'Update your address everywhere at once.', icon: 'Home', template: 'change_of_address', available: true },
  { key: 'married', label: 'I got married', description: 'Beneficiaries, surname and household changes.', icon: 'Heart', available: false },
  { key: 'job_change', label: 'I changed jobs', description: 'Group benefits, income and retirement funds.', icon: 'Briefcase', available: false },
  { key: 'vehicle', label: 'I bought a vehicle', description: 'Add cover before you drive it home.', icon: 'Car', available: false },
  { key: 'retirement', label: "I'm planning retirement", description: 'Start the conversation with your adviser.', icon: 'Sunset', available: false },
  { key: 'accident', label: "I've been in an accident", description: 'Open Accident Assist.', icon: 'TriangleAlert', available: true, route: '/accident-assist' },
];

/** Returns { workflow, plan } where plan lists what is affected and who does what. */
export async function reportMove({ clientId, newAddress }) {
  const template = getTemplate('change_of_address');
  const workflow = await startWorkflow('change_of_address', {
    clientId,
    title: 'Change of address',
    startAt: 1, // "Move reported" is done; next is the client's proof of address.
    actorType: 'client',
    actorName: 'Client',
  });

  if (!(await useSupabase())) {
    const hasPlaceholder = getState().documents.some((d) => d.clientId === clientId && d.type === 'proof_of_address' && d.status === 'missing');
    if (!hasPlaceholder) {
      setState((s) => ({
        ...s,
        documents: [{ id: uid('doc'), clientId, type: 'proof_of_address', name: 'Proof of address', status: 'missing', uploadedAt: null, expiryDate: null, workflowId: workflow.id }, ...s.documents],
      }));
    }
  }

  return {
    workflow,
    plan: {
      newAddress,
      affected: template.affects,
      neededFromYou: ['Proof of address'],
      royalSquareWill: ['Review information', 'Notify affected providers', 'Confirm completion'],
    },
  };
}
