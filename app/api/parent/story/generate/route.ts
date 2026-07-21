import { NextResponse, type NextRequest } from 'next/server';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId, firstChildIdInHousehold } from '@/lib/server/current-household';
import { generateStory } from '@/lib/anthropic-story';
import { computeAdaptivity } from '@/lib/comprehension/adaptivity';
import { parseChildSettings } from '@/lib/models/settings';
import { dueWords } from '@/lib/world/word-scheduler';
import { runQA } from '@/lib/qa/pipeline';
import { persistQA } from '@/lib/qa/persist';
import type { Book } from '@/lib/models/book';
import type { Json } from '@/types/database';

// Parent-side story generator. Single-user mode: no parent auth gate yet
// (add PARENT_PASSWORD before deploying).
// Full C3 flow: generate → runQA (stage 0/1/2) → decideStatus → persist QA →
// insert book row with the returned status. C3a contract enforced in
// decideStatus (hard-gate fail on final attempt = blocked).

const bodySchema = z.object({
  idea: z.string().min(1).max(2000),
  kind: z.enum(['quick', 'chapter']).default('quick'),
});

const MAX_ATTEMPTS = 2;

export async function POST(request: NextRequest) {
  const householdId = await currentHouseholdId();
  const childId = (await firstChildIdInHousehold()) ?? '';

  const gate = await requireParentPassword(); if (gate) return gate;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: child } = await admin()
    .from('children')
    .select('id, display_name, band, exclude_terms, pronouns, settings')
    .eq('id', childId)
    .single();
  if (!child) return NextResponse.json({ error: 'no_child' }, { status: 500 });

  // Adaptivity (brief §IV.3): vocabulary density + effective band from the
  // child's recent signal, pinned by the parent's Ease/Auto/Stretch; due
  // saved words come back in the new story (PRD B5 / C2).
  const [{ data: recentRecords }, { data: wordRows }] = await Promise.all([
    admin()
      .from('comprehension_records')
      .select('judged_signal')
      .eq('child_id', childId)
      .order('asked_at', { ascending: false })
      .limit(12),
    admin()
      .from('wordbook_entries')
      .select('word, saved_at, owned_at, last_encounter_at, encounter_count')
      .eq('child_id', childId)
      .order('saved_at', { ascending: false })
      .limit(40),
  ]);
  const adaptivity = computeAdaptivity({
    baseBand: (child.band ?? '4-8') as '3-4' | '4-6' | '4-8' | '6-8',
    readingLevel: parseChildSettings(child.settings).readingLevel,
    recentSignals: (recentRecords ?? []).map((r) => r.judged_signal).filter((v): v is string => Boolean(v)),
    recentKeeps: (wordRows ?? []).filter((w) => {
      const t = Date.parse(w.saved_at);
      return Number.isFinite(t) && Date.now() - t < 14 * 24 * 60 * 60 * 1000;
    }).length,
  });
  const due = dueWords(
    (wordRows ?? []).map((w) => ({
      word: w.word,
      savedAt: w.saved_at,
      ownedAt: w.owned_at,
      lastEncounterAt: w.last_encounter_at,
      encounterCount: w.encounter_count ?? 0,
    })),
    new Date(),
  )
    .slice(0, 3)
    .map((w) => w.word);

  const excludeTerms = Array.isArray(child.exclude_terms)
    ? (child.exclude_terms as string[])
    : [];
  const childCtx = {
    displayName: child.display_name,
    band: adaptivity.effectiveBand,
    excludeTerms,
    pronouns: child.pronouns ?? null,
  };

  let attempt = 0;
  let bestBook: Book | null = null;
  let bestStatus: 'draft' | 'checking' | 'published' | 'needs-review' | 'blocked' | 'unverified' | 'complete' | 'awaiting-choice' =
    'blocked';

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const book = await generateStory({
      householdId: householdId,
      child: childCtx,
      idea: body.data.idea,
      kind: body.data.kind,
      dueWords: due,
      vocabDensity: adaptivity.vocabDensity,
    });

    if (!book) {
      // Model returned unparseable — count the attempt, try again.
      continue;
    }

    // Force generated books through the maker flow. Override id/source/status
    // in case the model returned stale/random values.
    const generatedBook: Book = {
      ...book,
      id: book.id?.trim() || `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: 'generated',
      status: 'checking',
      kind: body.data.kind,
    };

    const qa = await runQA({
      householdId: householdId,
      book: generatedBook,
      child: { band: childCtx.band, excludeTerms },
      attempt,
    });

    await persistQA({
      bookId: generatedBook.id,
      householdId: householdId,
      attempt,
      result: qa,
    });

    if (qa.status === 'passed') {
      generatedBook.status = 'needs-review'; // parent reviews before it goes live
      bestBook = generatedBook;
      bestStatus = 'needs-review';
      break;
    }
    if (qa.status === 'blocked') {
      generatedBook.status = 'blocked';
      bestBook = generatedBook;
      bestStatus = 'blocked';
      // Don't retry blocked — the gate already ran its course.
      break;
    }
    // needs-review / unverified — keep as best so far; retry may improve.
    generatedBook.status = qa.status;
    bestBook = generatedBook;
    bestStatus = qa.status;
  }

  if (!bestBook) {
    return NextResponse.json({ error: 'generation_failed' }, { status: 502 });
  }

  const { error } = await admin()
    .from('books')
    .insert({
      id: bestBook.id,
      household_id: householdId,
      child_id: childId,
      title: bestBook.title,
      by_line: bestBook.by ?? null,
      kind: bestBook.kind,
      source: 'generated',
      status: bestStatus,
      cover_emoji: bestBook.coverEmoji ?? null,
      cover_bg: bestBook.coverBg ?? null,
      book: bestBook as unknown as Json,
      parent_guide: bestBook.parentGuide ?? null,
      origin_note: bestBook.originNote ?? null,
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookId: bestBook.id, status: bestStatus });
}
