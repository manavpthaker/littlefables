import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { requireParentSession } from '@/lib/server/parent-session';
import { listSharesForBook, mintShare, revokeShare } from '@/lib/server/book-shares';

// Parent-side share management. Restore-style scope check: the book must
// belong to the household making the request (single-family posture, but
// the check is here so multi-household later is safe).

const createSchema = z.object({
  bookId: z.string().min(1),
  password: z.string().min(1).max(200).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const revokeSchema = z.object({
  shareId: z.string().uuid(),
});

async function assertBookInHousehold(bookId: string, householdId: string): Promise<boolean> {
  const { data } = await admin()
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('household_id', householdId)
    .maybeSingle();
  return Boolean(data);
}

export async function GET(request: NextRequest) {
  const session = await requireParentSession(request);
  if (session instanceof NextResponse) return session;
  const householdId = session.householdId;
  const bookId = request.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!(await assertBookInHousehold(bookId, householdId))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const shares = await listSharesForBook(bookId, householdId);
  return NextResponse.json({ shares });
}

export async function POST(request: NextRequest) {
  const session = await requireParentSession(request);
  if (session instanceof NextResponse) return session;
  const householdId = session.householdId;
  const body = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!(await assertBookInHousehold(body.data.bookId, householdId))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const minted = await mintShare({
    bookId: body.data.bookId,
    householdId,
    password: body.data.password ?? null,
    expiresAt: body.data.expiresAt ?? null,
  }).catch((err: Error) => ({ error: err.message }));

  if ('error' in minted) return NextResponse.json({ error: minted.error }, { status: 500 });

  return NextResponse.json({
    shareId: minted.shareId,
    token: minted.token,
    // The caller constructs the full URL client-side using window.location.origin —
    // avoids the server having to know its own public URL.
    path: `/share/${minted.token}`,
  });
}

export async function DELETE(request: NextRequest) {
  const session = await requireParentSession(request);
  if (session instanceof NextResponse) return session;
  const householdId = session.householdId;
  const body = revokeSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const ok = await revokeShare(body.data.shareId, householdId);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
