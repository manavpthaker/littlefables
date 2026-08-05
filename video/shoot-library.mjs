// Screenshot each library view, for eyeballing shelf changes.
//
//   node shoot-library.mjs [outdir]
//
// Needs `pnpm dev`. LF_TOKEN should be a device token for a household with
// enough books to fill a grid — one book tells you nothing about a shelf.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.LF_TOKEN || 'QkwroaqqCFR7XyHAzSjA6Ka-VJcWIX4e3lXP7u3Zu8I';
const BASE = process.env.LF_BASE || 'http://localhost:3000';
const OUT = process.argv[2] || '/tmp/library';

const VIEWS = ['Grid', 'One at a time', 'List'];

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  for (const view of VIEWS) {
    await page.getByRole('button', { name: view }).click();
    await page.waitForTimeout(1200);
    const file = path.join(OUT, `${view.replace(/\s+/g, '-').toLowerCase()}.png`);
    await page.screenshot({ path: file });
    console.log(`  ${view.padEnd(14)} → ${file}`);
  }

  // A second frame of the single view, to confirm stepping works.
  await page.getByRole('button', { name: 'One at a time' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Next story' }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'one-at-a-time-2.png') });

  // Narrow, to check the grid falls back to two across.
  const phone = await browser.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 3 });
  const pp = await phone.newPage();
  await pp.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
  await pp.waitForTimeout(1800);
  await pp.getByRole('button', { name: 'Grid' }).click();
  await pp.waitForTimeout(1000);
  await pp.screenshot({ path: path.join(OUT, 'grid-phone.png') });
  console.log(`  phone grid     → ${OUT}/grid-phone.png`);

  await browser.close();
};

run();
