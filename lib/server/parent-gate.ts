import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';

// Parent Corner gate (S4.1). Plain env-var password → SHA-256 → HttpOnly
// cookie. All /api/parent/* routes call requireParentPassword(); /parent
// layout redirects to /parent/gate when the cookie is missing/stale.
//
// This isn't magic-link auth — it's a household-shared secret sufficient to
// keep the parent surface off the open internet. Rotate PARENT_PASSWORD to
// invalidate all sessions.

export const PARENT_COOKIE = 'lf_parent';
export const PARENT_COOKIE_TTL_DAYS = 30;

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Hash of the current PARENT_PASSWORD env var. Throws if unset — the
 *  parent surface must not run open. */
export function expectedHash(): string {
  const pw = process.env.PARENT_PASSWORD;
  if (!pw) throw new Error('PARENT_PASSWORD is required');
  return sha256(pw);
}

/** Constant-time comparison of the request's cookie against the expected
 *  hash. Returns true iff the cookie matches the current password. */
export async function isParentAuthed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(PARENT_COOKIE)?.value;
  if (!raw) return false;
  try {
    const expected = expectedHash();
    const a = Buffer.from(raw);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Guard for /api/parent/* routes. Returns null when authed, or a 401
 *  NextResponse the route should return directly. */
export async function requireParentPassword(): Promise<NextResponse | null> {
  if (await isParentAuthed()) return null;
  return NextResponse.json({ error: 'unauthorized', reason: 'parent_gate' }, { status: 401 });
}

/** Check a submitted password. Returns the cookie value to set on success,
 *  or null when wrong (or when PARENT_PASSWORD isn't configured). */
export function checkPassword(candidate: string): string | null {
  const pw = process.env.PARENT_PASSWORD;
  if (!pw || !candidate) return null;
  const a = Buffer.from(sha256(pw));
  const b = Buffer.from(sha256(candidate));
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return sha256(pw);
}
