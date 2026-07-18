import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { config } from 'dotenv';
import { spawn, type ChildProcess } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SEED_CHILD_ID, SEED_HOUSEHOLD_ID } from '@/lib/models/seed';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const isPlaceholder = SECRET_KEY === 'build-time-placeholder' || !SECRET_KEY;
const canRun =
  Boolean(SUPABASE_URL && !isPlaceholder) && process.env.CI_HTTP_TESTS === '1';

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;

// One route-level HTTP test per the work order — verifies /api/child/shelf's
// 401 and 200 paths against a real `next start` boot. Opt-in via CI_HTTP_TESTS=1
// so unit runs don't pay the boot cost.
describe.skipIf(!canRun)('shelf HTTP', () => {
  let server: ChildProcess | null = null;
  let tokenRaw: string | null = null;
  let deviceId: string | null = null;
  const client = createClient<Database>(SUPABASE_URL!, SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  beforeAll(async () => {
    // Spawn `next start` with the same env our unit runs use.
    server = spawn('pnpm', ['start', '--', '-p', String(PORT)], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'ignore',
    });
    // Wait for the port to accept connections.
    for (let i = 0; i < 60; i++) {
      try {
        const res = await fetch(BASE);
        if (res.status < 500) break;
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    // Mint a token directly.
    tokenRaw = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    const { data } = await client
      .from('child_devices')
      .insert({
        child_id: SEED_CHILD_ID,
        household_id: SEED_HOUSEHOLD_ID,
        device_label: 'ci-http',
        token_hash: hash,
        expires_at: expiresAt,
      })
      .select('id')
      .single();
    deviceId = data?.id ?? null;
  }, 90_000);

  afterAll(async () => {
    if (deviceId) await client.from('child_devices').delete().eq('id', deviceId);
    if (server) server.kill('SIGTERM');
  });

  it('rejects unauthenticated shelf requests with 401', async () => {
    const res = await fetch(`${BASE}/api/child/shelf`);
    expect(res.status).toBe(401);
  });

  it('serves the shelf when the token cookie is present', async () => {
    if (!tokenRaw) throw new Error('no token');
    const res = await fetch(`${BASE}/api/child/shelf`, {
      headers: { cookie: `lf_child_token=${tokenRaw}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { books: Array<{ id: string }> };
    expect(body.books.length).toBeGreaterThan(0);
  });
});
