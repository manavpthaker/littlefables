// Central Supabase env accessors. One place to change key names as Supabase's
// naming settles. Fails loud on missing values (PRD §4.6 — fail closed on money).

export function publicUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required (see .env.example)');
  return v;
}

export function publishableKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!v) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required (see .env.example)');
  return v;
}

export function secretKey(): string {
  const v = process.env.SUPABASE_SECRET_KEY;
  if (!v) throw new Error('SUPABASE_SECRET_KEY is required for server-side privileged ops');
  return v;
}
