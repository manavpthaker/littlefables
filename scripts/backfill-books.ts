#!/usr/bin/env tsx
// Backfill the redesign's authored fields onto existing books (brief §VI):
//   - vocab enrichment: syllables + kidDefinition per entry
//   - layerTag (sleep|feelings|courage|self)
//   - beats[] (the retell story-spine, 3-5 facts)
//   - retellPrompts (only when empty)
//   - hotspots for pages with approved scene art (Gemini vision)
// One Anthropic call per book (all text fields together); one Gemini call per
// arted page. Idempotent — present fields are kept unless --force. Writes go
// through bookSchema validation before touching books.book.
//
// Usage:
//   pnpm content:backfill -- --check                # dry-run, list what's missing
//   pnpm content:backfill -- --book brambles-hello  # one book
//   pnpm content:backfill -- --skip-hotspots        # text fields only
//   pnpm content:backfill -- --force                # re-author even if present
//
// Budget: ~1 'respond' call per book (9 books) + 1 'art' call per arted page —
// rides the same bump_usage rails as the app (fail-closed on money).

import { config } from 'dotenv';
config({ path: '.env.local' });

import { admin } from '../lib/supabase/admin';
import { callAnthropic, extractJson } from '../lib/anthropic';
import { generateHotspots } from '../lib/art/hotspots';
import { bookSchema, vocabEntrySchema, hotspotSchema, type Book } from '../lib/models/book';
import { LAYER_TAGS } from '../lib/models/layer-tags';
import { z } from 'zod';

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function argValue(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const CHECK = argFlag('check');
const FORCE = argFlag('force');
const SKIP_HOTSPOTS = argFlag('skip-hotspots');
const ONLY_BOOK = argValue('book');

const enrichmentSchema = z.object({
  layerTag: z.enum(LAYER_TAGS),
  beats: z.array(z.string().min(1).max(120)).min(3).max(5),
  retellPrompt: z.string().min(1).max(200),
  vocab: z.array(vocabEntrySchema),
});

function needsText(book: Book): boolean {
  if (FORCE) return true;
  const vocabThin = book.vocab.some((v) => !v.kidDefinition || !v.syllables?.length);
  return !book.layerTag || book.beats.length === 0 || book.retellPrompts.length === 0 || vocabThin;
}

async function enrichText(householdId: string, book: Book): Promise<Book | null> {
  const storyDigest = book.chapters
    .map((c, i) => `Chapter ${i + 1} "${c.title}":\n` + c.pages.map((p) => p.text).join(' '))
    .join('\n\n')
    .slice(0, 12_000);

  const system = [
    '# Role',
    'You annotate an existing children\'s book (reader age 4) for a reading app. You never rewrite the story.',
    '',
    '# Output — JSON only',
    '{',
    '  "layerTag": "sleep" | "feelings" | "courage" | "self"  (the developmental layer this story quietly works on),',
    '  "beats": ["3-5 short story facts in order — the retell checklist a 4-year-old could tell back"],',
    '  "retellPrompt": "Can you tell me the whole story of ...? — one warm spoken prompt",',
    '  "vocab": [every input vocab word, each with: word, meaning (keep as given), kidDefinition (the meaning said TO a 4-year-old, one short sentence), syllables (["bur","row"] — split by sound)]',
    '}',
  ].join('\n');

  const user = [
    `Title: ${book.title}`,
    `Teaching goals: ${book.teachingGoals.join('; ') || '(none listed)'}`,
    `Existing vocab: ${JSON.stringify(book.vocab)}`,
    '',
    'Story:',
    storyDigest,
  ].join('\n');

  const raw = await callAnthropic({
    householdId,
    kind: 'respond',
    system,
    user,
    maxTokens: 1200,
    temperature: 0.4,
  });
  const parsed = extractJson<z.infer<typeof enrichmentSchema>>(raw);
  const validated = parsed ? enrichmentSchema.safeParse(parsed) : null;
  if (!validated?.success) return null;
  const e = validated.data;

  return {
    ...book,
    layerTag: FORCE ? e.layerTag : (book.layerTag ?? e.layerTag),
    beats: FORCE || book.beats.length === 0 ? e.beats : book.beats,
    retellPrompts: book.retellPrompts.length > 0 ? book.retellPrompts : [e.retellPrompt],
    vocab: book.vocab.map((v) => {
      const enriched = e.vocab.find((ev) => ev.word.toLowerCase() === v.word.toLowerCase());
      if (!enriched) return v;
      return {
        ...v,
        kidDefinition: FORCE ? enriched.kidDefinition : (v.kidDefinition ?? enriched.kidDefinition),
        syllables: FORCE ? enriched.syllables : (v.syllables?.length ? v.syllables : enriched.syllables),
      };
    }),
  };
}

async function backfillHotspots(householdId: string, book: Book): Promise<{ book: Book; added: number }> {
  let added = 0;
  const chapters = [];
  for (const chapter of book.chapters) {
    const pages = [];
    for (const page of chapter.pages) {
      const img = (page as { img?: string }).img;
      const existing = z.array(hotspotSchema).safeParse(page.hotspots ?? []);
      const has = existing.success && existing.data.length > 0;
      if (!img || (has && !FORCE)) {
        pages.push(page);
        continue;
      }
      const hotspots = await generateHotspots({ householdId, imageUrl: img, pageText: page.text });
      if (hotspots && hotspots.length > 0) {
        pages.push({ ...page, hotspots });
        added += 1;
      } else {
        pages.push(page);
      }
    }
    chapters.push({ ...chapter, pages });
  }
  return { book: { ...book, chapters }, added };
}

async function main(): Promise<void> {
  let query = admin().from('books').select('id, title, household_id, book').order('id');
  if (ONLY_BOOK) query = query.eq('id', ONLY_BOOK);
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  if (!rows?.length) {
    console.log(ONLY_BOOK ? `No book "${ONLY_BOOK}" found.` : 'No books found.');
    return;
  }

  for (const row of rows) {
    const parsed = bookSchema.safeParse(row.book);
    if (!parsed.success) {
      console.warn(`✗ ${row.id}: book jsonb fails schema — skipping`);
      continue;
    }
    let book = parsed.data;
    const artedPages = book.chapters.flatMap((c) => c.pages).filter((p) => Boolean((p as { img?: string }).img));
    const wantsText = needsText(book);
    const wantsHotspots =
      !SKIP_HOTSPOTS &&
      artedPages.some((p) => FORCE || !(p.hotspots && p.hotspots.length > 0));

    if (!wantsText && !wantsHotspots) {
      console.log(`· ${row.id}: complete, skipping`);
      continue;
    }
    if (CHECK) {
      console.log(
        `? ${row.id}: would author${wantsText ? ' [layerTag/beats/retell/vocab]' : ''}${wantsHotspots ? ` [hotspots for ${artedPages.length} arted pages]` : ''}`,
      );
      continue;
    }

    if (wantsText) {
      const enriched = await enrichText(row.household_id, book);
      if (enriched) {
        book = enriched;
        console.log(`✓ ${row.id}: text fields authored (layer=${book.layerTag}, beats=${book.beats.length})`);
      } else {
        console.warn(`✗ ${row.id}: text enrichment failed (model output invalid) — keeping as-is`);
      }
    }

    if (wantsHotspots) {
      const result = await backfillHotspots(row.household_id, book);
      book = result.book;
      console.log(`✓ ${row.id}: hotspots on ${result.added} pages`);
    }

    const validated = bookSchema.safeParse(book);
    if (!validated.success) {
      console.warn(`✗ ${row.id}: enriched book fails schema — NOT writing`);
      continue;
    }
    const { error: writeErr } = await admin()
      .from('books')
      .update({ book: validated.data as unknown as never })
      .eq('id', row.id);
    if (writeErr) console.warn(`✗ ${row.id}: write failed — ${writeErr.message}`);
    else console.log(`✓ ${row.id}: saved`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
