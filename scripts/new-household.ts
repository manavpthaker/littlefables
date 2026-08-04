#!/usr/bin/env tsx
// Provision a new household (PRD Goal 6 — productizable). Extended for
// custom-order Etsy fulfillment: also mints a child_devices token and prints
// the magic URL the buyer opens on their iPad.
//
// Usage (family / dev):
//   pnpm exec tsx scripts/new-household.ts --name "Kim Family" --child "Sofia" --band 4-8
//
// Usage (custom order — full flow):
//   pnpm exec tsx scripts/new-household.ts \
//     --name "Zoe Family" \
//     --child "Zoe" \
//     --band 4-8 \
//     --email grandma@example.com \
//     --parent "Grandma Pat" \
//     --device-label "Grandma's iPad" \
//     --base-url https://littlefables.app
//
// Output includes: household uuid, parent uuid, child uuid, device token
// (raw, one-time), and a copy-paste-ready magic URL. Save these somewhere
// durable — the raw token can never be re-derived (only re-minted).
//
// To look up an existing household's active magic URL (e.g. buyer lost the
// email), re-run this script — it always mints a fresh device token. The
// old token stays valid until it expires or is revoked; issue a new URL
// and the buyer just uses whichever they click first.
//
// SQL fallback if the script isn't handy — mint a device row manually:
//   -- 1. find household + child
//   select h.id as household, c.id as child from households h
//     join children c on c.household_id = h.id
//     where h.name ilike '%Zoe%';
//   -- 2. mint via /api/parent/child-token or by running this script; do not
//   --    write to child_devices directly — token_hash is a SHA-256 of the raw,
//   --    and the raw is only visible at mint time.

import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { mintChildToken } from '../lib/auth/child-token';

config({ path: '.env.local' });

function arg(name: string): string | undefined {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const name = arg('name');
  const childName = arg('child');
  const band = (arg('band') ?? '4-8') as '3-4' | '4-6' | '4-8' | '6-8';
  const parentEmail = arg('email') ?? '';
  const parentName = arg('parent') ?? 'Parent';
  const deviceLabel = arg('device-label') ?? `${childName ?? 'child'}'s device`;
  const baseUrl = arg('base-url') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://littlefables.app';

  if (!name || !childName) {
    console.error('usage: pnpm exec tsx scripts/new-household.ts --name "Family Name" --child "Child Name" [--band 4-8] [--email x@y.z] [--parent "Papa"] [--device-label "iPad"] [--base-url https://...]');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');
  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const householdId = randomUUID();
  const parentId = randomUUID();
  const childId = randomUUID();

  const { error: hhErr } = await client.from('households').insert({ id: householdId, name });
  if (hhErr) throw new Error(`households insert: ${hhErr.message}`);

  const { error: pErr } = await client.from('parents').insert({
    id: parentId,
    household_id: householdId,
    email: parentEmail || `${name.toLowerCase().replace(/\s+/g, '.')}@example.local`,
    display_name: parentName,
  });
  if (pErr) throw new Error(`parents insert: ${pErr.message}`);

  const { error: cErr } = await client.from('children').insert({
    id: childId,
    household_id: householdId,
    display_name: childName,
    band,
    exclude_terms: [],
  });
  if (cErr) throw new Error(`children insert: ${cErr.message}`);

  // Mint the first device token — this is what the magic URL carries.
  // mintChildToken uses lib/supabase/admin, which reads the same env vars.
  const token = await mintChildToken({
    childId,
    householdId,
    deviceLabel,
  });

  const magicUrl = `${baseUrl.replace(/\/$/, '')}/f/${token.raw}`;

  console.log('✓ Provisioned:');
  console.log(`  household   ${householdId}  "${name}"`);
  console.log(`  parent      ${parentId}  <${parentEmail || '(placeholder)'}>`);
  console.log(`  child       ${childId}  "${childName}" (band ${band})`);
  console.log(`  device      ${token.deviceId}  "${deviceLabel}"  expires ${token.expiresAt}`);
  console.log('');
  console.log('  MAGIC URL   ' + magicUrl);
  console.log('');
  console.log('  Import books scoped to this household with:');
  console.log(`    pnpm content:add content/books/custom/<slug> --household ${householdId}`);
  console.log('');
  console.log('  The raw token above is only visible once. If lost, re-run this script');
  console.log('  to mint a fresh token — the old one stays valid until it expires.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
