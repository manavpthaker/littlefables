import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { saveWordSchema, type WordbookEntry } from '@/lib/models/wordbook';
import { vocabEntrySchema } from '@/lib/models/book';
import { stemOf } from '@/lib/reader/state';
import { bumpGrowth, loadWorldState } from '@/lib/world/state';
import { evaluateBadges, insertNewBadges } from '@/lib/world/badges';

// Look up the saved word in the book's authored vocab so the wordbook entry
// carries a real meaning (kidDefinition preferred). No LLM call at tap time
// (PRD A9 — meanings are authored/backfilled, repeat saves cost nothing).
async function lookupMeaning(
  bookId: string | undefined,
  householdId: string,
  word: string,
): Promise<string | null> {
  if (!bookId) return null;
  const { data: row } = await admin()
    .from('books')
    .select('book')
    .eq('id', bookId)
    .eq('household_id', householdId)
    .maybeSingle();
  const vocab = z.array(vocabEntrySchema).safeParse((row?.book as { vocab?: unknown })?.vocab ?? []);
  if (!vocab.success) return null;
  const stem = stemOf(word);
  const entry = vocab.data.find((v) => stemOf(v.word) === stem);
  return entry ? (entry.kidDefinition ?? entry.meaning) : null;
}

// Save a starred word to the child's wordbook (PRD A9).
// Dedupe is enforced by the unique constraint on (child_id, word). A re-save
// of an existing word is treated as a RE-ENCOUNTER (PRD B5): encounter_count
// bumps and last_encounter_at is set — the client's intent is "make sure this
// word is saved," and meeting a kept word again is signal, not noise.
export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = saveWordSchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: existing } = await admin()
    .from('wordbook_entries')
    .select('id, meaning, encounter_count')
    .eq('child_id', ctx.childId)
    .ilike('word', body.data.word)
    .maybeSingle();

  let data: {
    id: string;
    word: string;
    meaning: string | null;
    sentence: string | null;
    book_id: string | null;
    saved_at: string;
    owned_at: string | null;
  } | null = null;
  let error: { message: string } | null = null;
  const isReEncounter = Boolean(existing);

  if (existing) {
    const patch: {
      sentence: string | null;
      book_id: string | null;
      encounter_count: number;
      last_encounter_at: string;
      meaning?: string | null;
    } = {
      sentence: body.data.sentence ?? null,
      book_id: body.data.bookId ?? null,
      encounter_count: (existing.encounter_count ?? 0) + 1,
      last_encounter_at: new Date().toISOString(),
    };
    if (!existing.meaning) {
      patch.meaning = await lookupMeaning(body.data.bookId, ctx.householdId, body.data.word);
    }
    const res = await admin()
      .from('wordbook_entries')
      .update(patch)
      .eq('id', existing.id)
      .select('id, word, meaning, sentence, book_id, saved_at, owned_at')
      .single();
    data = res.data;
    error = res.error;
  } else {
    const meaning = await lookupMeaning(body.data.bookId, ctx.householdId, body.data.word);
    const res = await admin()
      .from('wordbook_entries')
      .insert({
        child_id: ctx.childId,
        word: body.data.word,
        meaning,
        sentence: body.data.sentence ?? null,
        book_id: body.data.bookId ?? null,
      })
      .select('id, word, meaning, sentence, book_id, saved_at, owned_at')
      .single();
    data = res.data;
    error = res.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'save_failed' }, { status: 500 });
  }

  // Bump growth + evaluate badges. Newly-earned slugs come back to the client
  // so it can bloom them via CelebrationQueue. Re-encounters don't inflate
  // wordsSaved — the word was already counted when first kept.
  if (!isReEncounter) await bumpGrowth(ctx.childId, 'wordsSaved', 1);
  const world = await loadWorldState(ctx.childId);
  const { count: readingDaysCount } = await admin()
    .from('reading_days')
    .select('day', { head: true, count: 'exact' })
    .eq('child_id', ctx.childId);
  const qualified = evaluateBadges({
    world,
    readingDaysCount: readingDaysCount ?? 0,
    hasSavedWord: true,
    hasCorrectCheckpoint: false,
  });
  const newlyEarned = await insertNewBadges(ctx.childId, qualified);

  const entry: WordbookEntry = {
    id: data.id,
    word: data.word,
    meaning: data.meaning,
    sentence: data.sentence,
    bookId: data.book_id,
    savedAt: data.saved_at,
    ownedAt: data.owned_at,
  };
  return NextResponse.json({ entry, newlyEarned });
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
