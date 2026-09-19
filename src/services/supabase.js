/**
 * Supabase client. Returns null when env vars are missing so the app
 * can fall back to mock data (see services/dataSource.js).
 * Only the ANON key is used here — never the service-role key.
 */
import { createClient } from '@supabase/supabase-js';
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/env.js';

export const supabase = IS_SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const isSupabaseConfigured = IS_SUPABASE_CONFIGURED;

export const STORAGE_BUCKETS = {
  clientDocuments: 'client-documents',
  claimEvidence: 'claim-evidence',
};

/** client-documents/{client_id}/{folder}/{filename} */
export function clientDocumentPath(clientId, folder, fileName) {
  return `${clientId}/${folder}/${Date.now()}-${fileName}`;
}

/** claim-evidence/{client_id}/{claim_id}/{filename} */
export function claimEvidencePath(clientId, claimId, fileName) {
  return `${clientId}/${claimId}/${Date.now()}-${fileName}`;
}
