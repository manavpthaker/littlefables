import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SEED_CHILD_ID } from '@/lib/models/seed';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const isPlaceholder = SECRET_KEY === 'build-time-placeholder' || !SECRET_KEY;
const canRun = Boolean(SUPABASE_URL && !isPlaceholder);

describe.skipIf(!canRun)('wordbook integration', () => {
  const client = createClient<Database>(SUPABASE_URL!, SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const testWord = `smoke-word-${Date.now()}`;

  afterAll(async () => {
    await client.from('wordbook_entries').delete().eq('child_id', SEED_CHILD_ID).eq('word', testWord);
  });

  it('upsert dedupes on (child_id, lower(word))', async () => {
    // First insert.
    const { error: err1 } = await client
      .from('wordbook_entries')
      .upsert(
        { child_id: SEED_CHILD_ID, word: testWord, sentence: 'first sentence' },
        { onConflict: 'child_id,word' },
      );
    expect(err1).toBeNull();

    // Second upsert with different sentence — should not error, should update.
    const { error: err2 } = await client
      .from('wordbook_entries')
      .upsert(
        { child_id: SEED_CHILD_ID, word: testWord, sentence: 'second sentence' },
        { onConflict: 'child_id,word' },
      );
    expect(err2).toBeNull();

    // Verify only one row exists for this word.
    const { data } = await client
      .from('wordbook_entries')
      .select('id, sentence')
      .eq('child_id', SEED_CHILD_ID)
      .eq('word', testWord);
    expect(data?.length).toBe(1);
    expect(data?.[0]?.sentence).toBe('second sentence');
  });
});
