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

// Every capture must run comfortably longer than the beat that uses it.
// Remotion's OffthreadVideo stalls on the last frame if a sequence outruns its
// source, which reads as the film freezing. This has been shipped twice now,
// so check-clips.mjs verifies it after every capture rather than trusting the
// pauses below to stay ahead of the edit.
const TOKEN = process.env.LF_TOKEN ?? 'fAJeL9TuziaPt_3cvwNkc3vuKeNJ74yuz-zvhJEV27k';
const BOOK = 'lantern-round-pond';
const OUT = 'public/recordings';
const TMP = '.capture-tmp';

// iPad Pro 11" landscape. The reader's spread layout needs the width.
const VIEWPORT = { width: 1194, height: 834 };

// Playwright scrolls an element into view instantly before clicking it, which
// on camera reads as the page teleporting. Travelling to each field first, at
// a speed a thumb would move, is what makes the form look like a form.
const reveal = async (locator) => {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await new Promise((r) => setTimeout(r, 850));
};

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sign the browser in, then open the book. Every shot starts here. */
async function openBook(page) {
  await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
  await page.getByText('The Lantern of Round Pond').first().click();
  await page.waitForSelector('main', { state: 'visible' });
  await pause(1200); // let art decode and the first page settle
}

const SHOTS = {
  /** 03 · the intake being filled in, including a photo. */
  intake: async (page) => {
    await page.goto(`${BASE}/intake`, { waitUntil: 'networkidle' });
    await pause(1400);

    const name = page.getByLabel("Child's name");
    await reveal(name);
    // Real typing speed. Speed-ramped typing reads as fake.
    await name.pressSequentially('Rosa', { delay: 180 });
    await pause(700);

    const age = page.getByRole('button', { name: '5–6', exact: true });
    await reveal(age);
    await age.click();
    await pause(700);

    // These have to produce the book the film goes on to deliver — geese over
    // the pond, a lantern nobody admits to lighting.
    await reveal(page.getByRole('button', { name: 'animals', exact: true }));
    for (const v of ['animals', 'ocean', 'magic']) {
      await page.getByRole('button', { name: v, exact: true }).click();
      await pause(500);
    }
    await pause(600);

    await reveal(page.getByRole('button', { name: 'curious', exact: true }));
    for (const v of ['curious', 'stubborn']) {
      await page.getByRole('button', { name: v, exact: true }).click();
      await pause(500);
    }
    await pause(700);

    const inspo = page.getByLabel('Art inspirations');
    await reveal(inspo);
    await inspo.pressSequentially('The Snowy Day, Julia Denos watercolour', { delay: 42 });
    await pause(900);

    const looks = page.getByLabel('What the child looks like');
    await reveal(looks);
    await looks.pressSequentially('Dark curly hair, warm brown skin, green cardigan', { delay: 38 });
    await pause(800);

    // A reference photo going in — the interaction is the point, so the file
    // itself is one of the book's own pages standing in for a family snap.
    await page.setInputFiles('input[type="file"]', 'public/book/01.png');
    await pause(1200);

    // Settle on the finished form rather than cutting on the upload.
    await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' }));
    await pause(2200);
  },

  /** 02 · shelf → tapping the book → the reader opening. */
  open: async (page) => {
    await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
    await pause(2600); // hold on the shelf so the cover reads
    await page.getByText('The Lantern of Round Pond').first().click();
    await page.waitForSelector('main', { state: 'visible' });
    await pause(5000);
  },



  /**
   * 06 · the whole reading session, one continuous take: press play, let the
   * page be read, turn to the next, tap a word.
   *
   * Was three separate captures cut together, and each one re-opened the book
   * — so page one appeared, the film cut, and page one appeared again before
   * flipping away. The hold after play is sized to outlast the narration the
   * film lays underneath it, so the voice finishes the page before the page
   * turns rather than talking over the cut.
   */
  payoff: async (page) => {
    await openBook(page);
    await pause(700);

    await page.getByRole('button', { name: 'Read to me' }).click();
    await pause(12000); // narration.mp3 is 9.9s — this outlasts it

    await page.getByLabel('Next page').click();
    await pause(5000);

    const word = page.getByLabel('Hear lantern').first();
    if (await word.count()) {
      await word.click();
    } else {
      await page.getByLabel(/^Hear /).first().click();
    }
    await pause(5000);
    await pause(3000);
  },


  /** 07 · the day-to-night switch, one continuous take. */
  night: async (page) => {
    await openBook(page);
    await pause(1600); // brief day-mode establish; the switch is the shot
    await page.getByLabel('Switch to bedtime reading').click();
    await pause(9000); // long hold on night so the palette shift can breathe
  },
};

// Playwright records WebM; Remotion wants H.264. Convert on the way out.
const FILENAME = {
  intake: '03-intake.mp4',
  open: '02-open.mp4',
  payoff: '06-payoff.mp4',
  night: '07-night.mp4',
};

async function main() {
  const requested = process.argv.slice(2);
  const names = requested.length ? requested : Object.keys(SHOTS);

  mkdirSync(OUT, { recursive: true });
  rmSync(TMP, { recursive: true, force: true });

  const failed = [];
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
      failed.push(name);
    }
  }

  await browser.close();
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });

  console.log('');
  console.log('  Still needed from a phone — neither is our software:');
  console.log('    01-email.mov        the delivery email');
  console.log('    03-add-to-home.mov  the iOS share sheet');

  // A failed shot used to exit 0. The previous recording stays on disk, the
  // render picks it up, and the film quietly ships footage of a UI that no
  // longer exists — which is exactly how this went wrong before. Fail loudly.
  if (failed.length) {
    console.error('');
    console.error(`  ${failed.length} shot(s) failed: ${failed.join(', ')}`);
    console.error('  The previous recordings are still on disk and WILL be used.');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
