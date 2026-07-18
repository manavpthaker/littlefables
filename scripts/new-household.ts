#!/usr/bin/env tsx
// Provision a new household (PRD Goal 6 — productizable). No code changes
// required: run this script with --name "Other Family" --child "Aria" and a
// new tenant appears with its own default child and default world state.
//
// Usage:
//   pnpm exec tsx scripts/new-household.ts --name "Kim Family" --child "Sofia" --band 4-8

import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

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

  if (!name || !childName) {
    console.error('usage: pnpm exec tsx scripts/new-household.ts --name "Family Name" --child "Child Name" [--band 4-8] [--email x@y.z] [--parent "Papa"]');
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

  console.log('✓ Provisioned:');
  console.log(`  household  ${householdId}  "${name}"`);
  console.log(`  parent     ${parentId}  <${parentEmail || '(placeholder)'}>`);
  console.log(`  child      ${childId}  "${childName}" (band ${band})`);
  console.log('');
  console.log('This household starts with no books. Import pack-000 or use the Maker.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
