/** Browser-safe configuration. Only VITE_* values ever reach the browser. */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * DEMO MODE — hackathon only.
 * Allows switching between Client View and Adviser View without real accounts.
 * Remove (or set VITE_ENABLE_DEMO_MODE=false) before any real launch.
 */
export const DEMO_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';

export const CHAT_ENDPOINT = '/api/chat';
