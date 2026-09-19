/**
 * Royal Square Assistant — browser side.
 * Calls OUR endpoint (/api/chat). The Groq key lives only on the server.
 * If the endpoint is unavailable (no key, offline), a small built-in guide answers
 * common navigation questions so the demo never dead-ends.
 */
import { CHAT_ENDPOINT } from '../config/env.js';
import { getState } from './store.js';
import { describeWorkflowStatus, getOwnerLabel } from '../utils/workflow.js';
import { computeDocumentStatus } from '../utils/documents.js';
import { describeDue, formatDate } from '../utils/format.js';

export const ADVICE_REDIRECT =
  'For financial advice or product recommendations, please speak to your Royal Square Financial adviser.';

export const SUGGESTED_QUESTIONS = [
  'How do I report an accident?',
  'What documents do I need for my annual review?',
  'Where can I upload my driver’s licence?',
  'What does “waiting on provider” mean?',
  'How do I update my address?',
];

/** Plain-text summary of the client's current status, sent as context. */
export function buildStatusContext(clientId) {
  const s = getState();
  const client = s.clients.find((c) => c.id === clientId);
  if (!client) return '';
  const providerName = (id) => s.providers.find((p) => p.id === id)?.name;
  const workflows = s.workflows
    .filter((w) => w.clientId === clientId && w.status === 'active')
    .map((w) => `- ${w.title}: ${describeWorkflowStatus(w, { providerName: providerName(w.providerId) })}. Current owner: ${getOwnerLabel(w.currentOwner, { providerName: providerName(w.providerId) })}. Next action: ${w.nextAction}. ${describeDue(w.dueDate)}.`);
  const tasks = s.tasks.filter((t) => t.clientId === clientId && t.assignee === 'client' && t.status === 'open').map((t) => `- ${t.title} (${describeDue(t.dueDate)})`);
  const docs = s.documents
    .filter((d) => d.clientId === clientId)
    .map((d) => `- ${d.name}: ${computeDocumentStatus(d).replace('_', ' ')}${d.expiryDate ? `, expires ${formatDate(d.expiryDate)}` : ''}`);
  return [
    `Client: ${client.firstName}`,
    'Active processes:',
    ...(workflows.length ? workflows : ['- none']),
    'Client actions:',
    ...(tasks.length ? tasks : ['- none']),
    'Documents:',
    ...docs,
  ].join('\n');
}

const FALLBACK_ANSWERS = [
  { match: /(invest|which (policy|product|fund)|should i (buy|take|choose)|recommend|best (policy|insurer|fund))/i, answer: ADVICE_REDIRECT },
  { match: /(accident|crash|collision)/i, answer: 'Tap the red “I’ve been in an accident” button, or go to Life Events → I’ve been in an accident. Accident Assist takes you through 10 short steps and still works without signal. If anyone is hurt, call 112 from a mobile first.' },
  { match: /(annual review|review documents)/i, answer: 'For your annual review we usually need your ID, proof of address (not older than 3 months), recent policy and investment statements, and proof of income. Upload them on the Documents page. Your adviser confirms the final list.' },
  { match: /(licen[cs]e|upload)/i, answer: 'Go to Documents → Upload document and choose the document type. For a driver’s licence we read the expiry date and set a renewal reminder for you.' },
  { match: /(waiting on provider|provider)/i, answer: '“Waiting on provider” means Royal Square has sent your request to the insurer or investment company and is waiting for them. Your adviser follows up; you don’t need to do anything.' },
  { match: /(address|moved|move)/i, answer: 'Go to Life Events → I moved. We create one change-of-address process that updates your profile and each affected policy. You only need to upload proof of address.' },
  { match: /(policy document|schedule|border letter|irp5|tax certificate)/i, answer: 'Go to Requests and choose the document you need. We request it from the provider and you can track who is holding it at every step.' },
  { match: /(claim|status|where is)/i, answer: 'Open Claims or your Dashboard. Each process shows who is holding the ball, the current step, the next action and the due date.' },
];

function fallbackAnswer(question) {
  const hit = FALLBACK_ANSWERS.find((f) => f.match.test(question));
  return hit ? hit.answer : 'I can help you find your way around the portal: reporting an accident, uploading documents, requests, and what a status means. For anything about your specific cover, please message your adviser.';
}

/**
 * messages: [{ role: 'user'|'assistant', content }]
 * Returns { reply, source: 'groq' | 'guide' }
 */
export async function sendChatMessage(messages, { clientId } = {}) {
  const context = clientId ? buildStatusContext(clientId) : '';
  const question = messages[messages.length - 1]?.content || '';
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    if (!response.ok) throw new Error(`Assistant unavailable (${response.status})`);
    const data = await response.json();
    if (!data.reply) throw new Error('Empty reply');
    return { reply: data.reply, source: 'groq' };
  } catch {
    return { reply: fallbackAnswer(question), source: 'guide' };
  }
}
