#!/usr/bin/env tsx
// Import pack-000 (family originals) into the seed household's books table.
// Idempotent (upsert on id). Validates against bookSchema before touching DB.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { packSchema } from '../lib/models/book';
import { deriveLayerTag } from '../lib/models/layer-tags';
import { SEED_HOUSEHOLD_ID } from '../lib/models/seed';

config({ path: '.env.local' });

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY required');

  const packPath = path.resolve('content/packs/pack-000-family-originals.json');
  const raw = JSON.parse(readFileSync(packPath, 'utf8'));
  const pack = packSchema.parse(raw);

  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let updated = 0;

  for (const story of pack.stories) {
    const { data: existing } = await client
      .from('books')
      .select('id, book, cover_bg')
      .eq('id', story.id)
      .maybeSingle();

    // Preserve img/coverImage that live on the existing row — those get
    // stitched in by the art-approve pipeline post-import and would be
    // silently clobbered by a plain upsert (S3.3 fix). We merge the pack's
    // authoritative text/interactivity with the DB's img fields.
    const mergedStory = mergePreservingArt(
      story as unknown as StoredBook,
      (existing?.book as StoredBook | null) ?? null,
    );

    // Derive a layerTag from teachingGoals when the pack didn't author one.
    // The AI backfill (scripts/backfill-books.ts) authors a richer answer
    // including beats + kidDefinitions, but that costs an Anthropic call per
    // book. This keyword fallback keeps shelf grouping / cover chips working
    // out-of-the-box on fresh clones and preserves whatever the DB already had.
    const existingLayer = (existing?.book as { layerTag?: string } | null)?.layerTag;
    if (!mergedStory.layerTag) {
      mergedStory.layerTag = existingLayer ?? deriveLayerTag(
        (story.teachingGoals ?? []),
        story.originNote ?? null,
      );
    }

    const row = {
      id: story.id,
      household_id: SEED_HOUSEHOLD_ID,
      child_id: null,
      title: story.title,
      by_line: story.by ?? null,
      kind: story.kind,
      source: story.source,
      status: story.status,
      cover_emoji: story.coverEmoji ?? null,
      // Preserve cover_bg URL if approved cover art has already been stitched;
      // fall back to the pack's cover_bg only when the DB has none.
      cover_bg: existing?.cover_bg?.startsWith('http') ? existing.cover_bg : (story.coverBg ?? null),
      book: mergedStory as unknown as Database['public']['Tables']['books']['Insert']['book'],
      parent_guide: story.parentGuide ?? null,
      origin_note: story.originNote ?? null,
    };

    const { error } = await client.from('books').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`upsert failed for ${story.id}: ${error.message}`);
    if (existing) updated++;
    else inserted++;
    console.log(`  ${existing ? '↺' : '+'} ${story.id} — ${story.title}`);
  }

  console.log(`\nDone. ${inserted} inserted, ${updated} updated.`);
}

interface StoredPage {
  text?: string;
  img?: string;
  [k: string]: unknown;
}
interface StoredChapter {
  title?: string;
  pages?: StoredPage[];
  [k: string]: unknown;
}
interface StoredBook {
  chapters?: StoredChapter[];
  coverImage?: string;
  layerTag?: string;
  [k: string]: unknown;
}

function mergePreservingArt(fresh: StoredBook, existing: StoredBook | null): StoredBook {
  if (!existing?.chapters) return fresh;
  const merged: StoredBook = { ...fresh };
  if (existing.coverImage) merged.coverImage = existing.coverImage;
  merged.chapters = (fresh.chapters ?? []).map((chapter, ci) => {
    const existingChapter = existing.chapters?.[ci];
    if (!existingChapter?.pages) return chapter;
    return {
      ...chapter,
      pages: (chapter.pages ?? []).map((page, pi) => {
        const img = existingChapter.pages?.[pi]?.img;
        return img ? { ...page, img } : page;
      }),
    };
  });
  return merged;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
