// Drive the real reader in a real browser and record it.
//
// Five of the seven shots in RECORDING.md are just someone tapping through the
// app — which Playwright can do more precisely than a hand, and record while it
// does. Shots 01 (an email) and 03 (the iOS share sheet) still need a phone,
// because neither is our software.
//
//   node capture.mjs                      # all shots
//   node capture.mjs pageTurn night       # named shots only
//
// Needs the dev server up:
//   pnpm exec next dev --turbopack

import { chromium } from 'playwright';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const BASE = process.env.LF_BASE ?? 'http://localhost:3000';
const TOKEN = process.env.LF_TOKEN ?? 'LwqpyUrSllZubYbWmMCUgDwbaRL3vlWu06YuuYgx7fU';
const BOOK = 'lantern-round-pond';
const OUT = 'public/recordings';
const TMP = '.capture-tmp';

// iPad Pro 11" landscape. The reader's spread layout needs the width.
const VIEWPORT = { width: 1194, height: 834 };

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sign the browser in, then open the book. Every shot starts here. */
async function openBook(page) {
  await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
  await page.getByText('The Lantern of Round Pond').first().click();
  await page.waitForSelector('main', { state: 'visible' });
  await pause(1200); // let art decode and the first page settle
}

const SHOTS = {
  /** 02 · shelf → tapping the book → the reader opening. */
  open: async (page) => {
    await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
    await pause(1800); // hold on the shelf so the cover reads
    await page.getByText('The Lantern of Round Pond').first().click();
    await page.waitForSelector('main', { state: 'visible' });
    await pause(2500);
  },

  /** 04 · two page turns, each flip captured whole. */
  pageTurn: async (page) => {
    await openBook(page);
    for (let i = 0; i < 2; i++) {
      await page.getByLabel('Next page').click();
      await pause(2200); // the flip is 700ms; the rest is breathing room
    }
  },

  /** 05 · tapping a word and watching it light up. */
  wordTap: async (page) => {
    await openBook(page);
    await page.getByLabel('Next page').click();
    await pause(1500);
    // "lantern" and "patient" are both in the vocab list — words a five-year-old
    // would actually stop on.
    for (const word of ['lantern', 'patient', 'Rosa']) {
      const target = page.getByLabel(`Hear ${word}`).first();
      if (await target.count()) {
        await target.click();
        await pause(2000);
        break;
      }
    }
    await pause(800);
  },

  /** 06 · pressing play, narration starting, words highlighting in sequence. */
  transport: async (page) => {
    await openBook(page);
    await pause(600);
    await page.getByLabel('Play').first().click();
    await pause(4500); // let several words highlight
  },

  /** 07 · the day-to-night switch, one continuous take. */
  night: async (page) => {
    await openBook(page);
    await pause(1800); // establish day mode with the illustration up
    await page.getByLabel('Switch to bedtime reading').click();
    await pause(3200); // hold on night so the palette shift reads
  },
};

// Playwright records WebM; Remotion wants H.264. Convert on the way out.
const FILENAME = {
  open: '02-open.mp4',
  pageTurn: '04-page-turn.mp4',
  wordTap: '05-word-tap.mp4',
  transport: '06-transport.mp4',
  night: '07-night.mp4',
};

async function main() {
  const requested = process.argv.slice(2);
  const names = requested.length ? requested : Object.keys(SHOTS);

  mkdirSync(OUT, { recursive: true });
  rmSync(TMP, { recursive: true, force: true });

  const browser = await chromium.launch();

  for (const name of names) {
    const shot = SHOTS[name];
    if (!shot) {
      console.error(`  unknown shot: ${name}`);
      continue;
    }

    // A context per shot, so each one lands in its own file.
    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      recordVideo: { dir: TMP, size: VIEWPORT },
      // The reader checks the clock to pick day or night; pin it to the
      // afternoon so "day mode" is actually day mode whenever this runs.
      timezoneId: 'America/New_York',
    });
    const page = await ctx.newPage();

    try {
      await shot(page);
      const video = page.video();
      await ctx.close(); // flushes the file
      const src = await video.path();
      const dest = join(OUT, FILENAME[name]);
      execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', src,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-an', dest,
      ]);
      console.log(`  ✓ ${FILENAME[name]}`);
    } catch (err) {
      await ctx.close().catch(() => {});
      console.error(`  ✗ ${name}: ${err.message.split('\n')[0]}`);
    }
  }

  await browser.close();
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });

  console.log('');
  console.log('  Still needed from a phone — neither is our software:');
  console.log('    01-email.mov        the delivery email');
  console.log('    03-add-to-home.mov  the iOS share sheet');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
