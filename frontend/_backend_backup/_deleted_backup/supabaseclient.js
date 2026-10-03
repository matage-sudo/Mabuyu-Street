// Server-side Supabase client.
//
// Uses the SERVICE ROLE key, which bypasses Row Level Security — that's
// correct here because this file only ever runs on the backend, never in
// the browser. NEVER import this file from frontend code, and never put
// SUPABASE_SERVICE_ROLE_KEY in a Vite/React env var (anything prefixed
// VITE_ is shipped to the browser bundle — keep this one backend-only).
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill these in from your Supabase project settings > API.'
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin };