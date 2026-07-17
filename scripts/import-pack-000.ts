#!/usr/bin/env tsx
// Import pack-000 (family originals) into the seed household's books table.
// Idempotent (upsert on id). Validates against bookSchema before touching DB.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { packSchema } from '../lib/models/book';

config({ path: '.env.local' });

const SEED_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001';

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
      .select('id')
      .eq('id', story.id)
      .maybeSingle();

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
      cover_bg: story.coverBg ?? null,
      book: story as unknown as Database['public']['Tables']['books']['Insert']['book'],
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
