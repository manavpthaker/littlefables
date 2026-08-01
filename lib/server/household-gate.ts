import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';

// Household password gate. When HOUSEHOLD_PASSWORD (or the legacy
// PARENT_PASSWORD) is set in env, any browser without a valid gate cookie
// gets redirected to /gate before it can reach any surface — kid or
// parent. Once unlocked, a 30-day cookie lets the household return
// friction-free.
//
// Share links (/share/[token]) intentionally bypass this gate — a share
// link is its own auth grant (see book_shares).
//
// When the env is unset the gate falls open and the app behaves as it did
// before the password was configured. Safe default for local dev.

const COOKIE_NAME = 'lf_household';
const COOKIE_TTL_DAYS = 30;

function passwordFromEnv(): string | null {
  const raw = process.env.HOUSEHOLD_PASSWORD ?? process.env.PARENT_PASSWORD;
  if (!raw || raw.trim().length === 0) return null;
  return raw.trim();
}

function hashOf(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function isHouseholdGateEnabled(): boolean {
  return passwordFromEnv() !== null;
}

export function householdCookieName(): string {
  return COOKIE_NAME;
}

export function householdCookieMaxAge(): number {
  return COOKIE_TTL_DAYS * 24 * 60 * 60;
}

/** Cookie value to set on successful unlock — sha256(password). Rotating
 *  the env invalidates every existing session automatically. */
export function householdCookieValue(): string | null {
  const p = passwordFromEnv();
  return p ? hashOf(p) : null;
}

/** Runs in RSC / API handlers (Node runtime). Reads cookie via next/headers. */
export async function isHouseholdAuthed(): Promise<boolean> {
  const p = passwordFromEnv();
  if (!p) return true; // gate off
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value ?? null;
    if (!token) return false;
    return safeEqual(token, hashOf(p));
  } catch {
    return false;
  }
}

/** Verify a submitted password. Used by POST /api/gate. */
export function verifyHouseholdPassword(submitted: string): { ok: true } | { ok: false; reason: string } {
  const p = passwordFromEnv();
  if (!p) return { ok: false, reason: 'gate disabled' };
  if (typeof submitted !== 'string' || submitted.length === 0) {
    return { ok: false, reason: 'missing password' };
  }
  if (!safeEqual(submitted, p)) return { ok: false, reason: 'wrong password' };
  return { ok: true };
}

/** Convenience for API routes that need to reject unauthed requests. */
export async function requireHouseholdGate(): Promise<NextResponse | null> {
  if (await isHouseholdAuthed()) return null;
  return NextResponse.json({ error: 'gate_locked' }, { status: 401 });
}
