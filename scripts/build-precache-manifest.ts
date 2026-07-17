#!/usr/bin/env tsx
// Build-time SW version stamp. Runs before `next build`. Restores the
// placeholder first (so re-runs are idempotent), then writes a git-sha-derived
// stamp so every deploy evicts old caches on activate.
//
// Audit S6 fix: precache list is code-defined, not hand-maintained. When we
// grow to precaching per-book audio manifests, this script queries Supabase
// at build time and rewrites the PRECACHE_URLS block from the result.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SW_SRC = path.resolve('public/sw.js');
const PLACEHOLDER = '__SW_VERSION__';
const STAMP_RE = /const SW_VERSION = '[^']+';/;

function version(): string {
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return sha || 'nogit';
  } catch {
    return `t${Date.now()}`;
  }
}

const MODE = process.argv.includes('--restore') ? 'restore' : 'stamp';

function main(): void {
  if (!existsSync(SW_SRC)) throw new Error(`missing ${SW_SRC}`);
  const src = readFileSync(SW_SRC, 'utf8');

  if (MODE === 'restore') {
    // postbuild: leave the working tree clean so `git status` is quiet.
    const restored = src.replace(STAMP_RE, `const SW_VERSION = '${PLACEHOLDER}';`);
    writeFileSync(SW_SRC, restored);
    console.log('SW version restored to placeholder');
    return;
  }

  const stamp = version();
  // Idempotent: match the SW_VERSION line whether it currently holds the
  // placeholder or a previous stamp.
  const stamped = src.replace(STAMP_RE, `const SW_VERSION = '${stamp}';`);
  writeFileSync(SW_SRC, stamped);
  console.log(`SW version stamped: ${stamp}${src.includes(PLACEHOLDER) ? '' : ' (was already stamped)'}`);
}

main();
