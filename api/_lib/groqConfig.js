/**
 * Single place to configure the Groq model.
 * Override with the GROQ_MODEL environment variable (Vercel → Settings → Environment Variables).
 * Files in api/_lib are NOT exposed as routes by Vercel (underscore prefix).
 */
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
export const GROQ_FALLBACK_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'llama-4-scout-17b-16e-instruct',
];
export const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export function getGroqConfig() {
  const configuredModel = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const models = [configuredModel, ...GROQ_FALLBACK_MODELS.filter((fallback) => fallback !== configuredModel)];

  return {
    apiKey: process.env.GROQ_API_KEY || '',
    models,
    temperature: 0.3,
    maxTokens: 600,
  };
}
