import { NextResponse } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';

// Child shelf: books scoped to the child's household, excluding drafts and
// blocked. PRD F1 rule: the kid shelf never shows drafts/blocked/unverified.
const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'] as const;

export async function GET() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await admin()
    .from('books')
    .select('id, title, kind, source, status, cover_emoji, cover_bg, updated_at')
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES as unknown as string[])
    .eq('shelf_enabled', true)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    books: (data ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      kind: b.kind,
      coverEmoji: b.cover_emoji,
      coverBg: b.cover_bg,
      status: b.status,
    })),
  });
}
