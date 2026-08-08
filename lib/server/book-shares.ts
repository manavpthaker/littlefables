import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { admin } from '@/lib/supabase/admin';

// Book-share tokens. Each token grants public /share/[token] access to one
// book row. Tokens are 24 random bytes (base64url) → 32 chars → hard to guess.
// Only the sha256 hash is stored server-side; the raw token appears once in
// the mint response and lives only in the URL.
//
// `book_shares` isn't in types/database.ts until `pnpm db:types` runs after
// applying migration 20260801000017. Until then, cast the client via a
// hand-typed shim so the code compiles + runs against the real table.

export interface ShareContext {
  shareId: string;
  /** Null = library share: the token grants the household's whole shelf. */
  bookId: string | null;
  householdId: string;
  requiresPassword: boolean;
  passwordHash: string | null;
}

export interface MintShareInput {
  /** Null mints a library share (book_id null → whole shelf). */
  bookId: string | null;
  householdId: string;
  password?: string | null;
  expiresAt?: string | null;
  createdBy?: string | null;
}

export interface MintedShare {
  raw: string;
  token: string;
  shareId: string;
}

interface BookShareRow {
  id: string;
  book_id: string | null;
  household_id: string;
  token_hash: string;
  password_hash: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  view_count: number | null;
  created_at: string;
  created_by: string | null;
}

interface BookShareInsert {
  book_id: string | null;
  household_id: string;
  token_hash: string;
  password_hash?: string | null;
  expires_at?: string | null;
  created_by?: string | null;
}

interface BookShareUpdate {
  view_count?: number;
  revoked_at?: string;
}

// Hand-typed table shim. Regenerating types/database.ts after the migration
// will make this cast unnecessary; kept narrow so we don't lose type help
// on the fields we actually touch.
type Shares = {
  from: (t: 'book_shares') => {
    insert: (row: BookShareInsert) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq?: (col: string, val: string) => { is: (c: string, v: null) => { order: (c: string, o: unknown) => Promise<{ data: BookShareRow[] | null }> } };
        maybeSingle?: () => Promise<{ data: BookShareRow | null }>;
        is?: (c: string, v: null) => { order: (c: string, o: unknown) => Promise<{ data: BookShareRow[] | null }> };
      };
    };
    update: (patch: BookShareUpdate) => {
      eq: (col: string, val: string) => {
        eq?: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      } & Promise<{ error: { message: string } | null }>;
    };
  };
};

function shares(): Shares {
  return admin() as unknown as Shares;
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function mintShare(input: MintShareInput): Promise<MintedShare> {
  const raw = randomBytes(24).toString('base64url');
  const tokenHash = sha256(raw);
  const passwordHash = input.password ? sha256(input.password) : null;

  const { data, error } = await shares()
    .from('book_shares')
    .insert({
      book_id: input.bookId,
      household_id: input.householdId,
      token_hash: tokenHash,
      password_hash: passwordHash,
      expires_at: input.expiresAt ?? null,
      created_by: input.createdBy ?? null,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(`mintShare failed: ${error?.message ?? 'unknown'}`);
  return { raw, token: raw, shareId: data.id };
}

export async function loadShare(token: string): Promise<ShareContext | null> {
  if (!token) return null;
  const tokenHash = sha256(token);

  const q = shares().from('book_shares').select('id, book_id, household_id, password_hash, expires_at, revoked_at')
    .eq('token_hash', tokenHash);
  const { data } = await (q.maybeSingle as () => Promise<{ data: BookShareRow | null }>)();

  if (!data) return null;
  if (data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return null;

  return {
    shareId: data.id,
    bookId: data.book_id,
    householdId: data.household_id,
    requiresPassword: Boolean(data.password_hash),
    passwordHash: data.password_hash,
  };
}

export function verifySharePassword(passwordHash: string, submitted: string): boolean {
  if (!submitted) return false;
  return safeEqual(passwordHash, sha256(submitted));
}

/** Fire-and-forget view counter bump. Never blocks the reader render. */
export async function bumpShareViewCount(shareId: string): Promise<void> {
  try {
    const q = shares().from('book_shares').select('view_count').eq('id', shareId);
    const { data } = await (q.maybeSingle as () => Promise<{ data: { view_count: number | null } | null }>)();
    const next = ((data?.view_count as number | null) ?? 0) + 1;
    await shares().from('book_shares').update({ view_count: next }).eq('id', shareId);
  } catch {
    /* silent */
  }
}

export async function revokeShare(shareId: string, householdId: string): Promise<boolean> {
  const { error } = await shares()
    .from('book_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq?.('household_id', householdId) as unknown as { error: { message: string } | null };
  return !error;
}

export async function listSharesForBook(bookId: string, householdId: string) {
  const q = shares().from('book_shares')
    .select('id, password_hash, expires_at, revoked_at, view_count, created_at')
    .eq('book_id', bookId);
  const chained = (q.eq as (col: string, val: string) => { is: (c: string, v: null) => { order: (c: string, o: unknown) => Promise<{ data: BookShareRow[] | null }> } })(
    'household_id',
    householdId,
  );
  const { data } = await chained.is('revoked_at', null).order('created_at', { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id,
    hasPassword: Boolean(s.password_hash),
    expiresAt: s.expires_at,
    viewCount: s.view_count ?? 0,
    createdAt: s.created_at,
  }));
}
