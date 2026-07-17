import { afterAll, describe, expect, it } from 'vitest';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SEED_CHILD_ID, SEED_HOUSEHOLD_ID } from '@/lib/models/seed';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const isPlaceholder = SECRET_KEY === 'build-time-placeholder' || !SECRET_KEY;
const canRun = Boolean(SUPABASE_URL && !isPlaceholder);

describe.skipIf(!canRun)('progress integration', () => {
  const client = createClient<Database>(SUPABASE_URL!, SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const testBookId = 'brambles-hello';

  afterAll(async () => {
    await client
      .from('book_progress')
      .delete()
      .eq('child_id', SEED_CHILD_ID)
      .eq('book_id', testBookId);
  });

  it('upserts progress + reads it back', async () => {
    await client
      .from('book_progress')
      .upsert(
        { child_id: SEED_CHILD_ID, book_id: testBookId, chapter_idx: 0, page_idx: 3 },
        { onConflict: 'child_id,book_id' },
      );
    const { data } = await client
      .from('book_progress')
      .select('chapter_idx, page_idx')
      .eq('child_id', SEED_CHILD_ID)
      .eq('book_id', testBookId)
      .single();
    expect(data?.chapter_idx).toBe(0);
    expect(data?.page_idx).toBe(3);
  });

  it('same-book upsert overwrites (last-write-wins)', async () => {
    await client
      .from('book_progress')
      .upsert(
        { child_id: SEED_CHILD_ID, book_id: testBookId, chapter_idx: 0, page_idx: 3 },
        { onConflict: 'child_id,book_id' },
      );
    await client
      .from('book_progress')
      .upsert(
        { child_id: SEED_CHILD_ID, book_id: testBookId, chapter_idx: 0, page_idx: 7 },
        { onConflict: 'child_id,book_id' },
      );
    const { data } = await client
      .from('book_progress')
      .select('page_idx')
      .eq('child_id', SEED_CHILD_ID)
      .eq('book_id', testBookId)
      .single();
    expect(data?.page_idx).toBe(7);
  });

  it('progress belongs to the seed household child only', async () => {
    // Verify the seed child's household matches — sanity check on our data.
    const { data: child } = await client
      .from('children')
      .select('household_id')
      .eq('id', SEED_CHILD_ID)
      .single();
    expect(child?.household_id).toBe(SEED_HOUSEHOLD_ID);
  });
});
