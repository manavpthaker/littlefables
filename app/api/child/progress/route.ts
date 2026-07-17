import { NextResponse, type NextRequest } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { progressBodySchema, type ProgressRecord } from '@/lib/models/progress';

// Reader progress sync (PRD A7 subset). Write-through — full bidirectional
// D2 merge lands in Phase 2. For progress specifically, last-write-wins is
// fine (kids don't collaborate on reading a single book).

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = progressBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Verify the book belongs to the child's household (defense in depth — the
  // FK cascade would let you write progress for another household's book id
  // if we didn't check).
  const { data: book } = await admin()
    .from('books')
    .select('id')
    .eq('id', body.data.bookId)
    .eq('household_id', ctx.householdId)
    .maybeSingle();
  if (!book) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { error } = await admin()
    .from('book_progress')
    .upsert(
      {
        child_id: ctx.childId,
        book_id: body.data.bookId,
        chapter_idx: body.data.chapterIdx,
        page_idx: body.data.pageIdx,
      },
      { onConflict: 'child_id,book_id' },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// GET /api/child/progress?bookId=X — a specific book's progress.
// GET /api/child/progress — all books' progress for the child (drives ContinueCard).
export async function GET(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const bookId = new URL(request.url).searchParams.get('bookId');
  let query = admin()
    .from('book_progress')
    .select('book_id, chapter_idx, page_idx, updated_at')
    .eq('child_id', ctx.childId);
  if (bookId) query = query.eq('book_id', bookId);

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const records: ProgressRecord[] = (data ?? []).map((r) => ({
    bookId: r.book_id,
    chapterIdx: r.chapter_idx,
    pageIdx: r.page_idx,
    updatedAt: r.updated_at,
  }));
  if (bookId) return NextResponse.json({ progress: records[0] ?? null });
  return NextResponse.json({ progress: records });
}
