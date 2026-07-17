import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// PRD §4.6 + AUDIT C3: middleware refreshes parent session ONLY.
// It does not authorize /api/* — routes call requireParentSession /
// requireChildDevice themselves so every route is guarded explicitly.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$).*)'],
};
