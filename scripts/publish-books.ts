#!/usr/bin/env tsx
/**
 * One-book publisher. Runs `content:add` then `content:narrate` on a
 * single book folder — the every-day shortcut for "I just finished this
 * story, put it on the shelf."
 *
 * Usage:
 *   pnpm content:publish                                    # picks the folder (prompts if multiple)
 *   pnpm content:publish content/books/brambles-hello       # explicit
 *   pnpm content:publish --voice day                        # narrate day only
 *   pnpm content:publish --check                            # dry-run add + narrate
 *   pnpm content:publish --force                            # pass through to narrate
 *   pnpm content:publish --skip-narrate                     # add only
 *   pnpm content:publish --skip-import                      # narrate only
 *
 * Any unknown flag / value gets forwarded to the underlying scripts.
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

interface Args {
  folder: string | null; // null → discover
  passthrough: string[];
  skipImport: boolean;
  skipNarrate: boolean;
}

function parseArgs(): Args {
  const raw = process.argv.slice(2);
  let folder: string | null = null;
  const passthrough: string[] = [];
  let skipImport = false;
  let skipNarrate = false;

  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (!a) continue;
    if (a === '--skip-import') { skipImport = true; continue; }
    if (a === '--skip-narrate') { skipNarrate = true; continue; }
    if (a === '--check' || a === '--force') { passthrough.push(a); continue; }
    // Flags that take a value.
    if (a === '--voice' || a === '--day-voice' || a === '--night-voice' || a === '--household') {
      const val = raw[i + 1];
      if (val !== undefined) {
        passthrough.push(a, val);
        i += 1;
      }
      continue;
    }
    if (a.startsWith('--')) {
      // Unknown flag — pass through as-is.
      passthrough.push(a);
      continue;
    }
    // First non-flag arg is the folder.
    if (folder === null) folder = resolve(a);
  }

  return { folder, passthrough, skipImport, skipNarrate };
}

/** Every child directory of content/books/ that carries a story.json. */
function discoverBooks(): string[] {
  const root = resolve('content/books');
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .map((name) => join(root, name))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, 'story.json')))
    .sort();
}

async function pickFolder(): Promise<string> {
  const found = discoverBooks();
  if (found.length === 0) {
    console.error('\nNo books found under content/books/. Author one first — see content/AUTHORING-PROMPT.md.');
    process.exit(1);
  }
  if (found.length === 1) {
    console.log(`\n📖 One book found: ${basename(found[0]!)}`);
    return found[0]!;
  }
  console.log('\nMultiple books found:');
  found.forEach((f, i) => console.log(`  ${i + 1}. ${basename(f)}`));
  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question('\nPick one (number): ')).trim();
    const idx = Number.parseInt(answer, 10) - 1;
    if (Number.isNaN(idx) || idx < 0 || idx >= found.length) {
      console.error('Invalid selection.');
      process.exit(1);
    }
    return found[idx]!;
  } finally {
    rl.close();
  }
}

function runStep(step: 'add' | 'narrate', folder: string, extraArgs: string[]): boolean {
  const script = step === 'add' ? 'scripts/import-book.ts' : 'scripts/narrate-book.ts';
  console.log(`\n▸ ${step} ${basename(folder)}`);
  const res = spawnSync('pnpm', ['exec', 'tsx', script, folder, ...extraArgs], { stdio: 'inherit' });
  return res.status === 0;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const folder = args.folder ?? (await pickFolder());

  if (!existsSync(join(folder, 'story.json'))) {
    console.error(`\nNo story.json in ${folder}`);
    process.exit(1);
  }

  let importOk: boolean | null = null;
  let narrateOk: boolean | null = null;

  if (!args.skipImport) {
    importOk = runStep('add', folder, args.passthrough);
    if (!importOk) {
      console.error('\n✗ add failed — skipping narrate.');
      process.exit(1);
    }
  }

  if (!args.skipNarrate) {
    narrateOk = runStep('narrate', folder, args.passthrough);
  }

  console.log('\n──────── done ────────');
  console.log(`  ${basename(folder)}`);
  if (importOk !== null) console.log(`    add:      ${importOk ? '✓' : '✗'}`);
  if (narrateOk !== null) console.log(`    narrate:  ${narrateOk ? '✓' : '✗'}`);
  if (narrateOk === false) process.exit(1);
}

void main();
