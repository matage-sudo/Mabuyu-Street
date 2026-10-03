import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
    "Set them in Vercel → Project → Settings → Environment Variables."
  );
}

// Reuse a single client across warm invocations.
let cached = globalThis.__mabuyuSupabaseAdmin;
if (!cached) {
  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  globalThis.__mabuyuSupabaseAdmin = cached;
}

export const supabaseAdmin = cached;
