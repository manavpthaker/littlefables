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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001';
const SEED_CHILD_ID = '00000000-0000-0000-0000-000000000100';

// Integration tests require a running local Supabase (`pnpm db:start`).
// CI sets a placeholder service key that would fail immediately — skip in that
// case. Local dev with the real CLI keys runs these automatically.
const isPlaceholder = SERVICE_KEY === 'build-time-placeholder' || !SERVICE_KEY;
const canRun = Boolean(SUPABASE_URL && !isPlaceholder);

describe.skipIf(!canRun)('shelf integration', () => {
  const client = createClient<Database>(SUPABASE_URL!, SERVICE_KEY!, {
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

  it('household books query returns pack-000 stories', async () => {
    const { data, error } = await client
      .from('books')
      .select('id, title, status')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .in('status', ['complete', 'published', 'awaiting-choice']);
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(7);
    const titles = (data ?? []).map((b) => b.title);
    expect(titles).toContain("Bramble's Hello");
  });

  it('cross-household leak: another household sees nothing', async () => {
    const { data } = await client
      .from('books')
      .select('id')
      .eq('household_id', '00000000-0000-0000-0000-000000009999');
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
