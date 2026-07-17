import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { ShelfGrid, type ShelfBook } from './shelf-grid';

// Kid shelf home. Server component fetches books directly via service-role +
// household scope (child-device auth was verified in the layout AND is
// re-verified here — every route/RSC that reads child data must call it).
const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

export default async function ReadHome() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent/auth/login');

  const { data } = await admin()
    .from('books')
    .select('id, title, kind, source, status, cover_emoji, cover_bg')
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .order('title');

  const books: ShelfBook[] = (data ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    kind: b.kind as 'quick' | 'chapter',
    coverEmoji: b.cover_emoji,
    coverBg: b.cover_bg,
    status: b.status,
  }));

  return (
    <main>
      <header style={{ padding: 'var(--space-4) var(--space-4) 0', display: 'grid', gap: 'var(--space-1)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: 28 }}>Your shelf</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{books.length} stories</p>
      </header>
      <ShelfGrid books={books} />
    </main>
  );
}
