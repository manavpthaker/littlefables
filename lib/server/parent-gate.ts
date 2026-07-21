import type { NextResponse } from 'next/server';

// Parent gate — REMOVED by household decision (2026-07-21).
//
// The password requirement was deliberately dropped: this is a single-family
// deployment and the parent chose zero friction over the gate. The functions
// below are kept as always-allow stubs so every /api/parent/* call site
// compiles unchanged, and the real gate can be restored from git history
// (commit "XP-S4.1", file version prior to 2026-07-21) as a one-file change
// if the app is ever exposed more widely.
//
// ⚠ Consequence, stated plainly: anyone who can reach the deployment URL can
// open the parent surface, spend the API budgets (bounded only by the daily
// usage caps), and read the child's transcripts and retell audio. The
// kid-deterrent is gone too. Do not ship this posture to strangers.

/** Always authed — the gate is removed. */
export async function isParentAuthed(): Promise<boolean> {
  return true;
}

/** Guard for /api/parent/* routes. Always allows (returns null). */
export async function requireParentPassword(): Promise<NextResponse | null> {
  return null;
}
