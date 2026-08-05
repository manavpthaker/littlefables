import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { publicUrl, publishableKey } from './env';

// Publishable-key (anon) client for Supabase Auth operations from server
// routes. Distinct from admin(): the service role client bypasses gates
// like `shouldCreateUser: false` on signInWithOtp, so OTP send/verify
// must go through the publishable client.
//
// Auth-only. Do not use this client to read/write app tables — it's
// subject to RLS as an anonymous request. For privileged DB ops use
// admin().

let cached: SupabaseClient<Database> | null = null;

export function publicAuth(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createSupabaseClient<Database>(publicUrl(), publishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
