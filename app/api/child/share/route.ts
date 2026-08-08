import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { mintShare } from '@/lib/server/book-shares';

// Share-mint for the reader menu. The device holding the child token IS the
// family (single-family posture), so it may hand out share links directly —
// no detour through the parent surface. Scope stays household-tight: a book
// share is validated against the household, and a library share (no bookId)
// only ever grants that household's shelf.

const bodySchema = z.object({ bookId: z.string().min(1).optional() });

const KID_VISIBLE_STATUSES = ['complete', 'published'];

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const bookId = body.data.bookId ?? null;
  if (bookId) {
    const { data } = await admin()
      .from('books')
      .select('id')
      .eq('id', bookId)
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    const minted = await mintShare({ bookId, householdId: ctx.householdId });
    // Caller builds the absolute URL from window.location.origin.
    return NextResponse.json({ path: `/share/${minted.token}` });
  } catch {
    return NextResponse.json({ error: 'share_failed' }, { status: 500 });
  }
}
