import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';

// Parent gate — cookie-based password check.
//
// Posture: when PARENT_PASSWORD is set (production, staging, any team dev),
// every parent HTML surface and /api/parent/* route requires a valid cookie.
// When it's UNSET (local dev with an empty .env.local), the gate falls open
// so a fresh clone works out-of-the-box. A prebuild step (scripts/check-env.ts,
// wired via package.json "prebuild") REFUSES to build a production bundle
// when the env is unset — "temporary" bypass can't accidentally ship.
//
// Defense-in-depth: middleware.ts also checks the cookie for parent routes.
// requireParentPassword() is intentionally re-run inside every /api/parent/*
// handler so no route is guarded by middleware alone (CLAUDE.md rule).

const COOKIE_NAME = 'lf_parent';

function expectedToken(password: string): string {
  // sha-256(password) as a hex string. Cheap, deterministic, not reversible
  // — the value stored client-side is a hash of the shared secret, not the
  // password itself. Rotating PARENT_PASSWORD invalidates all sessions.
  return createHash('sha256').update(password).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function passwordFromEnv(): string | null {
  const raw = process.env.PARENT_PASSWORD;
  if (!raw || raw.trim().length === 0) return null;
  return raw.trim();
}

async function cookieToken(): Promise<string | null> {
  try {
    const jar = await cookies();
    return jar.get(COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

/** Is the current request authed as a parent? True when the gate is disabled
 *  (no env password set) or the cookie matches the expected hash. */
export async function isParentAuthed(): Promise<boolean> {
  const password = passwordFromEnv();
  if (!password) return true; // gate disabled — dev / bootstrap
  const token = await cookieToken();
  if (!token) return false;
  return safeEqual(token, expectedToken(password));
}

/** Guard for /api/parent/* routes. Returns 401 NextResponse when the gate is
 *  enabled and the cookie is missing/invalid; null when allowed. */
export async function requireParentPassword(): Promise<NextResponse | null> {
  if (await isParentAuthed()) return null;
  return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
}

/** Verifies a submitted password. Used by /api/parent/gate to decide whether
 *  to set the cookie. */
export function verifyParentPassword(submitted: string): { ok: true } | { ok: false; reason: string } {
  const password = passwordFromEnv();
  if (!password) return { ok: false, reason: 'gate disabled' };
  if (typeof submitted !== 'string' || submitted.length === 0) {
    return { ok: false, reason: 'missing password' };
  }
  if (!safeEqual(submitted, password)) return { ok: false, reason: 'wrong password' };
  return { ok: true };
}

export function parentCookieName(): string {
  return COOKIE_NAME;
}

/** Cookie value to set on successful gate — a sha-256 of the password.
 *  Rotating the env invalidates every session. */
export function parentCookieValue(): string | null {
  const password = passwordFromEnv();
  return password ? expectedToken(password) : null;
}

export function isGateEnabled(): boolean {
  return passwordFromEnv() !== null;
}
