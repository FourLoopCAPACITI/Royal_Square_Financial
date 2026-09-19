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
import { getFallbackGuide, getLanguage } from '../i18n/index.js';

export const SUGGESTED_QUESTION_KEYS = [
  'chat.suggest.accident',
  'chat.suggest.review',
  'chat.suggest.licence',
  'chat.suggest.provider',
  'chat.suggest.address',
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

/** Built-in guide in the user's language (locales → chat), used when the live assistant is unreachable. */
function fallbackAnswer(question) {
  const guide = getFallbackGuide();
  const hit = guide.fallback.find((f) => f.match.test(question));
  if (!hit) return guide.default;
  return hit.answer === 'advice' ? guide.advice : hit.answer;
}

/**
 * messages: [{ role: 'user'|'assistant', content }]
 * The selected language is sent explicitly so the model never has to guess it.
 * Returns { reply, source: 'groq' | 'guide' }
 */
export async function sendChatMessage(messages, { clientId } = {}) {
  const context = clientId ? buildStatusContext(clientId) : '';
  const question = messages[messages.length - 1]?.content || '';
  const language = getLanguage();
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context, language }),
    });
    if (!response.ok) throw new Error(`Assistant unavailable (${response.status})`);
    const data = await response.json();
    if (!data.reply) throw new Error('Empty reply');
    return { reply: data.reply, source: 'groq' };
  } catch {
    return { reply: fallbackAnswer(question), source: 'guide' };
  }
}
