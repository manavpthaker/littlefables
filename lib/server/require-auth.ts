import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { CHILD_TOKEN_COOKIE, verifyChildToken, type ChildContext } from '@/lib/auth/child-token';

// Route guards. Phase 0 single-household mode: only the child-device token is
// verified. Parent Corner is unauthenticated. Add requireParentPassword when
// deploying — see PARENT_PASSWORD env note in .env.example.

export function unauthorized(reason: string): NextResponse {
  return NextResponse.json({ error: 'unauthorized', reason }, { status: 401 });
}

export async function requireChildDevice(): Promise<ChildContext | NextResponse> {
  const store = await cookies();
  const raw = store.get(CHILD_TOKEN_COOKIE)?.value;
  const ctx = await verifyChildToken(raw);
  if (!ctx) return unauthorized('no child device session');
  return ctx;
}
