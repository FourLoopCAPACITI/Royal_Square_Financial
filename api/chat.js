/**
 * POST /api/chat — Royal Square Assistant (Vercel Function).
 *
 * Browser → /api/chat → this function → Groq API
 * The GROQ_API_KEY lives only in the server environment and is never sent to the browser.
 *
 * Written against plain Node req/res so the same handler runs on Vercel and
 * inside the local Vite dev server (see vite.config.js).
 */
import { getGroqConfig, GROQ_ENDPOINT } from './_lib/groqConfig.js';
import { buildSystemPrompt } from './_lib/assistantPrompt.js';

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_CONTEXT_CHARS = 3000;

function shouldTryNextModel(status) {
  return status === 400 || status === 408 || status === 409 || status === 429 || status === 404 || status >= 500;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sanitiseMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  const { apiKey, models, temperature, maxTokens } = getGroqConfig();
  if (!apiKey) {
    return send(res, 503, {
      error: 'assistant_not_configured',
      message: 'The assistant is temporarily unavailable. Please try again later.',
    });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON body.' });
  }

  const messages = sanitiseMessages(body.messages);
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { error: 'Send at least one user message.' });
  }
  const context = typeof body.context === 'string' ? body.context.slice(0, MAX_CONTEXT_CHARS) : '';

  for (const model of models) {
    try {
      const groqResponse = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [{ role: 'system', content: buildSystemPrompt(context) }, ...messages],
        }),
      });

      if (!groqResponse.ok) {
        const detail = await groqResponse.text();
        console.error('Groq error', { model, status: groqResponse.status, detail: detail.slice(0, 500) });
        if (shouldTryNextModel(groqResponse.status)) continue;
        return send(res, 502, { error: 'assistant_unavailable', message: 'The assistant is temporarily unavailable. Please try again later.' });
      }

      const data = await groqResponse.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (reply) return send(res, 200, { reply, model });
      console.error('Groq returned an empty reply', { model });
    } catch (err) {
      console.error('Groq request failed', { model, message: err?.message });
    }
  }

  return send(res, 503, { error: 'assistant_unavailable', message: 'The assistant is temporarily unavailable. Please try again later.' });
}
