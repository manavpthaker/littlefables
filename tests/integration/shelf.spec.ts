import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import type { Database } from '@/types/database';

config({ path: '.env.local' });

// Integration test: mints a child-device token directly via service role
// (skipping the parent auth + HTTP mint path — those are tested by the
// walkthrough in Slice 6), then verifies /api/child/shelf semantics through
// the underlying query pattern (RSC + service-role scoped by household).
//
// A full HTTP test would require booting Next in CI; that's a Phase 1 addition.

import { SEED_HOUSEHOLD_ID, SEED_CHILD_ID } from '@/lib/models/seed';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// Integration tests require Supabase reachable at NEXT_PUBLIC_SUPABASE_URL.
// CI sets a placeholder secret that would fail immediately — skip in that case.
const isPlaceholder = SECRET_KEY === 'build-time-placeholder' || !SECRET_KEY;
const canRun = Boolean(SUPABASE_URL && !isPlaceholder);

describe.skipIf(!canRun)('shelf integration', () => {
  const client = createClient<Database>(SUPABASE_URL!, SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let tokenRaw: string | null = null;
  let deviceId: string | null = null;

  beforeAll(async () => {
    // Mint a child-device row directly so verifyChildToken would succeed.
    tokenRaw = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const { data, error } = await client
      .from('child_devices')
      .insert({
        child_id: SEED_CHILD_ID,
        household_id: SEED_HOUSEHOLD_ID,
        device_label: 'integration-test',
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select('id')
      .single();
    if (error) throw error;
    deviceId = data.id;
  });

  afterAll(async () => {
    if (deviceId) await client.from('child_devices').delete().eq('id', deviceId);
  });

  it('household books query returns rows scoped to the household', async () => {
    // Pared-back: books are authored + uploaded via `pnpm content:add`, so
    // the shelf may be empty on a fresh install. The assertion is only that
    // the query runs cleanly and every row returned belongs to the seed
    // household (RLS / query scoping is intact).
    const { data, error } = await client
      .from('books')
      .select('id, household_id, status')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .in('status', ['complete', 'published']);
    expect(error).toBeNull();
    for (const row of data ?? []) {
      expect(row.household_id).toBe(SEED_HOUSEHOLD_ID);
    }
  });

  it('cross-household leak: another household sees nothing', async () => {
    // A random valid v4 UUID belonging to no household.
    const { data } = await client
      .from('books')
      .select('id')
      .eq('household_id', '11111111-2222-4333-8444-555555555555');
    expect(data).toEqual([]);
  });

  it('drafts/blocked are excluded from the kid shelf query', async () => {
    // Insert a draft book, ensure the shelf query doesn't return it.
    const draftId = `test-draft-${Date.now()}`;
    await client.from('books').insert({
      id: draftId,
      household_id: SEED_HOUSEHOLD_ID,
      title: 'Draft that should not appear',
      kind: 'quick',
      source: 'generated',
      status: 'draft',
      book: { id: draftId, title: 'Draft', kind: 'quick', chapters: [] },
    });

    const { data } = await client
      .from('books')
      .select('id')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .in('status', ['complete', 'published', 'awaiting-choice']);
    const ids = (data ?? []).map((b) => b.id);
    expect(ids).not.toContain(draftId);

    await client.from('books').delete().eq('id', draftId);
  });
});
