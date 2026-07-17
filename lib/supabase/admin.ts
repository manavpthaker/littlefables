import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Service-role client for privileged server operations (child-token verification,
// content import, art approval, usage counter). PRD §4.6: fail closed on money —
// throws loudly if the secret is missing rather than silently degrading.
let cached: SupabaseClient<Database> | null = null;

export function admin(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) required. Set both in .env.local.',
    );
  }
  cached = createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
