import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { publicUrl, secretKey } from './env';

// Service-role/secret-key client for privileged server operations (child-token
// verification, content import, art approval, usage counter). PRD §4.6:
// fail closed on money — throws loudly if the secret is missing.
let cached: SupabaseClient<Database> | null = null;

export function admin(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createSupabaseClient<Database>(publicUrl(), secretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
