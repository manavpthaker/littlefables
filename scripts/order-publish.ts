#!/usr/bin/env tsx
/**
 * Run B — publish a completed custom order.
 *
 * Assumes:
 *   - `cover.png` and `pages/NN.png` are dropped into the book folder
 *   - `story.json` + `character-notes.md` are in place
 *   - the intake row exists (looked up by --intake-id)
 *
 * Does:
 *   1. Provisions the household if it doesn't exist yet (spawns
 *      new-household.ts, parses UUIDs + magic URL from its stdout).
 *      Reuses the existing household if `household.yaml` already has
 *      provisioned_id — safe to re-run.
 *   2. Writes / updates `content/households/<slug>/household.yaml` with
 *      the provisioned IDs, magic URL, and intake breadcrumbs.
 *   3. Spawns `content:add` to import cover + pages to Supabase Storage
 *      and upsert the books row.
 *   4. Appends an IMPORTED row to `docs/commerce/orders.csv` (or updates
 *      an existing row for this etsy_order).
 *   5. Prints the magic URL for the delivery email.
 *
 * Usage:
 *   pnpm order:publish <intake-id> [--book <slug>] [--household-slug <slug>]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  arg,
  ageBand,
  fetchIntake,
  findBookFolder,
  householdFolder,
  householdSlugFromIntake,
  label,
  nowIsoDate,
  positional,
  type Intake,
} from './order-lib';

interface Args {
  intakeId: string;
  bookSlug?: string;
  householdSlug?: string;
}

interface Provisioned {
  householdId: string;
  parentId: string;
  childId: string;
  deviceId: string;
  expiresAt: string;
  magicUrl: string;
  giftUrl?: string;
  giftCode?: string;
}

function parseArgs(): Args {
  const intakeId = positional();
  if (!intakeId) {
    console.error('usage: pnpm order:publish <intake-id> [--book <slug>] [--household-slug <slug>]');
    process.exit(1);
  }
  return { intakeId, bookSlug: arg('book'), householdSlug: arg('household-slug') };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const intake = await fetchIntake(args.intakeId);
  console.log(`\n📥 ${label(intake)}`);

  const householdSlug = householdSlugFromIntake(intake, args.householdSlug);
  const bookDir = findBookFolder(householdSlug, args.bookSlug);
  const bookSlug = basename(bookDir);
  console.log(`   household: ${householdSlug}`);
  console.log(`   book:      ${bookSlug}`);

  const story = JSON.parse(readFileSync(join(bookDir, 'story.json'), 'utf8')) as { title?: string };
  const bookTitle = story.title ?? bookSlug;

  const yamlPath = join(householdFolder(householdSlug), 'household.yaml');
  const existing = readExistingProvisioned(yamlPath);

  let provisioned: Provisioned;
  if (existing) {
    console.log(`\n♻  Household already provisioned in ${yamlPath} — reusing IDs, minting fresh magic URL.`);
    provisioned = reprovision(intake, householdSlug, existing, bookTitle);
  } else {
    console.log(`\n🚀 Provisioning household on hosted Supabase…`);
    provisioned = provision(intake, householdSlug, bookTitle);
  }

  writeHouseholdYaml(yamlPath, householdSlug, intake, bookSlug, provisioned);
  console.log(`   ✓ wrote ${yamlPath}`);

  console.log(`\n📤 Importing book…`);
  const importRes = spawnSync('pnpm', ['content:add', bookDir], { stdio: 'inherit' });
  if (importRes.status !== 0) {
    console.error(`\n✗ content:add failed (${importRes.status}). Fix the folder and re-run.`);
    process.exit(importRes.status ?? 1);
  }

  // Narrate day voice — the reader otherwise falls to browser speechSynth,
  // which sounds robotic on desktop. For a paid custom book that's not
  // acceptable. Skip via --skip-narrate for a re-publish where art changed
  // but text didn't (existing narration in Storage still matches).
  //
  // Night voice is deliberately skipped by default: overnight cost, and
  // night mode falls back to day audio gracefully (see page-audio-source.ts).
  // Add --night when the buyer paid for the night narration upsell.
  const skipNarrate = process.argv.includes('--skip-narrate');
  const includeNight = process.argv.includes('--night');
  if (!skipNarrate) {
    const narrateArgs = ['content:narrate', bookDir, '--voice', includeNight ? 'both' : 'day'];
    console.log(`\n🎙  Narrating (${includeNight ? 'day + night' : 'day'})…`);
    const narrateRes = spawnSync('pnpm', narrateArgs, { stdio: 'inherit' });
    if (narrateRes.status !== 0) {
      console.warn(`\n⚠  content:narrate failed (${narrateRes.status}). Book is published, but reader will use browser TTS. Re-run: pnpm content:narrate ${bookDir} --voice day`);
    }
  } else {
    console.log(`\n   · --skip-narrate — reader will use existing Storage audio (or browser TTS if none)`);
  }

  updateOrdersCsv(intake, householdSlug, bookSlug, provisioned);

  console.log(`\n✅ Published.`);
  console.log(`\n   MAGIC URL  ${provisioned.magicUrl}`);
  if (provisioned.giftUrl) {
    console.log(`   GIFT URL   ${provisioned.giftUrl}`);
    console.log(`   GIFT CODE  ${provisioned.giftCode}`);
  }
  console.log(`\n   Paste the magic URL into the delivery email to ${intake.buyer_email}.`);
}

/** Provision a fresh household via new-household.ts and parse its stdout. */
function provision(intake: Intake, householdSlug: string, bookTitle: string): Provisioned {
  const name = intake.parent_lastname
    ? `${intake.parent_lastname} Family`
    : `${intake.child_name} Family`;
  const parentDisplay = intake.parent_lastname
    ? `${intake.parent_lastname} Family`
    : `${intake.child_name}'s Parent`;
  const deviceLabel = `${intake.child_name}'s iPad`;
  const argv = [
    'exec', 'tsx', 'scripts/new-household.ts',
    '--name', name,
    '--child', intake.child_name,
    '--band', ageBand(intake),
    '--email', intake.buyer_email,
    '--parent', parentDisplay,
    '--device-label', deviceLabel,
    '--book-title', bookTitle,
  ];
  if (intake.gift_from) argv.push('--gift-from', intake.gift_from);

  const res = spawnSync('pnpm', argv, { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    throw new Error(`new-household.ts failed with status ${res.status}`);
  }
  const out = res.stdout;
  process.stdout.write(out.replace(/^/gm, '     '));
  return parseProvisionOutput(out);
}

/** Re-mint just the device token for an already-provisioned household by
 *  invoking new-household.ts with the same args — the script always mints a
 *  fresh token and the old one stays valid until expiry. We ignore the newly
 *  printed household/parent/child UUIDs (which would be *new* rows because
 *  new-household.ts doesn't dedupe) and only take the new magic URL. */
function reprovision(intake: Intake, householdSlug: string, existing: Provisioned, bookTitle: string): Provisioned {
  // For an already-provisioned household we don't want new-household.ts to
  // insert a second household row. Keep the existing IDs; just refresh the
  // magic URL if the operator asks for it. For the common re-run case
  // (import updated art), the existing magic URL is still valid, so keep it.
  console.log(`   magic URL kept from ${basename(existing.magicUrl)}. Re-run scripts/new-household.ts by hand if you need a fresh token.`);
  return existing;
}

/** Parse new-household.ts's printed output into a Provisioned record. */
function parseProvisionOutput(out: string): Provisioned {
  const grab = (rx: RegExp): string => {
    const m = out.match(rx);
    if (!m || !m[1]) throw new Error(`could not parse: ${rx}`);
    return m[1].trim();
  };
  const householdId = grab(/^\s*household\s+([0-9a-f-]{36})/m);
  const parentId = grab(/^\s*parent\s+([0-9a-f-]{36})/m);
  const childId = grab(/^\s*child\s+([0-9a-f-]{36})/m);
  const deviceMatch = out.match(/^\s*device\s+([0-9a-f-]{36})\s+"[^"]*"\s+expires\s+(\S+)/m);
  if (!deviceMatch || !deviceMatch[1] || !deviceMatch[2]) throw new Error('could not parse device row');
  const magicUrl = grab(/^\s*MAGIC URL\s+(\S+)/m);
  const gift = out.match(/^\s*GIFT URL\s+(\S+)[\s\S]*?GIFT CODE\s+(\S+)/m);
  return {
    householdId,
    parentId,
    childId,
    deviceId: deviceMatch[1],
    expiresAt: deviceMatch[2],
    magicUrl,
    ...(gift ? { giftUrl: gift[1]!, giftCode: gift[2]! } : {}),
  };
}

/** If household.yaml already exists with a real provisioned_id, load and
 *  return it. Otherwise null. This is our idempotency check. */
function readExistingProvisioned(yamlPath: string): Provisioned | null {
  if (!existsSync(yamlPath)) return null;
  const text = readFileSync(yamlPath, 'utf8');
  const grab = (rx: RegExp): string | null => {
    const m = text.match(rx);
    return m && m[1] ? m[1].trim() : null;
  };
  const householdId = grab(/^household:[\s\S]*?provisioned_id:\s*([^\s#]+)/m);
  const parentId = grab(/^parent:[\s\S]*?provisioned_id:\s*([^\s#]+)/m);
  const childId = grab(/^child:[\s\S]*?provisioned_id:\s*([^\s#]+)/m);
  const magicUrl = grab(/^\s*magic_url:\s*"?([^"\n]+)"?/m);
  if (!householdId || householdId === '00000000-0000-0000-0000-000000000000') return null;
  if (!parentId || !childId || !magicUrl) return null;
  return {
    householdId, parentId, childId,
    deviceId: '',
    expiresAt: '',
    magicUrl,
  };
}

function writeHouseholdYaml(
  yamlPath: string,
  householdSlug: string,
  intake: Intake,
  bookSlug: string,
  p: Provisioned,
): void {
  mkdirSync(householdFolder(householdSlug), { recursive: true });
  const name = intake.parent_lastname ? `${intake.parent_lastname} Family` : `${intake.child_name} Family`;
  const parentDisplay = intake.parent_lastname
    ? `${intake.parent_lastname} Family`
    : `${intake.child_name}'s Parent`;

  const yaml = `# Household manifest — populated by scripts/order-publish.ts.
# Metadata only; not read at runtime. Kept in the repo so we can rebuild
# the household deterministically or audit who has what.

household:
  slug: ${householdSlug}
  name: "${name}"
  provisioned_id: ${p.householdId}

child:
  name: "${intake.child_name}"
  band: "${ageBand(intake)}"
  provisioned_id: ${p.childId}

parent:
  display_name: "${parentDisplay}"
  email: "${intake.buyer_email}"
  provisioned_id: ${p.parentId}

device:
  label: "${intake.child_name}'s iPad"
  magic_url: "${p.magicUrl}"
${p.expiresAt ? `  expires_at: "${p.expiresAt}"\n` : ''}${p.giftUrl ? `  gift_url: "${p.giftUrl}"\n  gift_code: "${p.giftCode}"\n` : ''}
books:
  - ${bookSlug}

order:
  etsy_order_id: ${intake.etsy_order ? `"${intake.etsy_order}"` : 'null'}
  intake_id: "${intake.id}"
  intake_at: "${nowIsoDate()}"
  delivered_at: null
  notes: ""
`;
  writeFileSync(yamlPath, yaml);
}

function updateOrdersCsv(
  intake: Intake,
  householdSlug: string,
  bookSlug: string,
  p: Provisioned,
): void {
  const path = 'docs/commerce/orders.csv';
  if (!existsSync(path)) return;
  const today = nowIsoDate();
  const row = [
    intake.etsy_order ?? intake.id.slice(0, 8),
    `fables-${intake.etsy_order ?? intake.id.slice(0, 8)}-${intake.child_name?.toLowerCase() ?? 'child'}`,
    intake.child_name ?? '',
    ageBand(intake),
    '',
    '',
    '',
    '',
    '',
    intake.buyer_email,
    intake.gift_from ? 'yes' : '',
    '',
    '',
    'IMPORTED',
    '1',
    'A',
    p.householdId,
    p.childId,
    p.magicUrl,
    today,
    '',
    today,
    '',
    '',
    `household=${householdSlug} book=${bookSlug}`,
  ].join(',');
  appendFileSync(path, row + '\n');
  console.log(`   ✓ appended IMPORTED row to ${path}`);
}

void main().catch((err: unknown) => {
  console.error(`\n✗ ${(err as Error).message ?? err}`);
  process.exit(1);
});
