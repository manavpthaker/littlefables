import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { WordList } from './word-list';

// The kid's Word Book (PRD A9 follow-through). Every word he chose to keep,
// as tappable capsules — tap to hear it again. This is the answer to "where
// does starring a word LEAD": stars land here, reachable from Home.
// Removal is a parent action (Parent Corner → Wordbook), never a kid one.

export default async function WordsPage() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const { data } = await admin()
    .from('wordbook_entries')
    .select('id, word, meaning, sentence, saved_at, owned_at')
    .eq('child_id', ctx.childId)
    .order('saved_at', { ascending: false });

  const words = (data ?? []).map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    sentence: w.sentence,
    owned: Boolean(w.owned_at),
  }));

  return <WordList words={words} />;
}
