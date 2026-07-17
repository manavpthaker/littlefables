import { NextResponse, type NextRequest } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { saveWordSchema, type WordbookEntry } from '@/lib/models/wordbook';

// Save a starred word to the child's wordbook (PRD A9).
// Dedupe is enforced by the unique index on (child_id, lower(word)) in
// migration 0001. This route swallows duplicate-key errors and returns 200 —
// the client's intent is "make sure this word is saved," not "insert a new row."
export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = saveWordSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data, error } = await admin()
    .from('wordbook_entries')
    .upsert(
      {
        child_id: ctx.childId,
        word: body.data.word,
        sentence: body.data.sentence ?? null,
        book_id: body.data.bookId ?? null,
      },
      { onConflict: 'child_id,word' },
    )
    .select('id, word, meaning, sentence, book_id, saved_at, owned_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entry: WordbookEntry = {
    id: data.id,
    word: data.word,
    meaning: data.meaning,
    sentence: data.sentence,
    bookId: data.book_id,
    savedAt: data.saved_at,
    ownedAt: data.owned_at,
  };
  return NextResponse.json({ entry });
}

// GET returns the full wordbook for the child (used by /read wordbook page later).
export async function GET() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const { data, error } = await admin()
    .from('wordbook_entries')
    .select('id, word, meaning, sentence, book_id, saved_at, owned_at')
    .eq('child_id', ctx.childId)
    .order('saved_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entries: WordbookEntry[] = (data ?? []).map((r) => ({
    id: r.id,
    word: r.word,
    meaning: r.meaning,
    sentence: r.sentence,
    bookId: r.book_id,
    savedAt: r.saved_at,
    ownedAt: r.owned_at,
  }));
  return NextResponse.json({ entries });
}
