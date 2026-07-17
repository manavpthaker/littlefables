import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Browser client factory. Anon key only — never reach for service role in the browser.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
