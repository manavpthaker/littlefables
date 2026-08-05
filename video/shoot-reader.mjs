// Screenshot the reader in both orientations, for eyeballing UI changes.
//
//   node scripts/shoot-reader.mjs [outdir]
//
// Needs `pnpm dev` running. Token is a dev child-device token; the route sets
// the cookie and redirects into the reader.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.LF_TOKEN || 'LwqpyUrSllZubYbWmMCUgDwbaRL3vlWu06YuuYgx7fU';
const BASE = process.env.LF_BASE || 'http://localhost:3000';
const OUT = process.argv[2] || '/tmp/reader';

const SHOTS = [
  { name: 'portrait', width: 820, height: 1180 },
  { name: 'landscape', width: 1180, height: 820 },
];

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const shot of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
    // Into the first book, then past the cover onto a narrative page.
    const book = page.locator('a[href*="/read/story/"]').first();
    if (await book.count()) {
      await book.click();
      await page.waitForLoadState('networkidle');
    }
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, `${shot.name}-cover.png`) });

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(OUT, `${shot.name}-page.png`) });

    console.log(`  ${shot.name} → ${OUT}`);
    await ctx.close();
  }

  await browser.close();
};

run();
