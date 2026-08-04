// Capture the logomark animations to PNG sequences with alpha.
//
//   node capture-mark.mjs
//
// The mark's motion lives in a CSS harness the designer wrote
// (littlefables-mark-animations.html). Rather than reinterpret those keyframes
// as Remotion interpolations — which drifts from the designer's intent every
// time either side is edited — this drives the real CSS and photographs it.
//
// The trick that makes it deterministic: CSS animations are wall-clock based,
// so a frame-by-frame renderer cannot simply "play" them. Every animation is
// paused and its currentTime set explicitly per frame via the Web Animations
// API. Same input, same pixels, every run.
//
// Output is transparent PNG, so the film can lay the mark over paper, over a
// page, over anything.

import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

// Vendored beside its consumer: the sequences are too large to commit, so the
// thing they are generated from has to be in the repo or the film cannot be
// rebuilt from a fresh clone.
const HARNESS = process.env.MARK_HARNESS || path.join(process.cwd(), 'mark-harness.html');

const FPS = 30;
const INK = '#2A1D12'; // Heritage --ink
const SIZE = 900; // display is ~260px; this leaves retina headroom

// Which harness treatment, how long, and where it lands.
const SHOTS = [
  // The cold open. Trunk draws up its centreline, branches extend, leaves pop,
  // rays open last. Harness delays run to ~1.3s + stagger, so 2.6s covers it
  // with room to settle.
  { tile: 'grow', name: 'grow', seconds: 2.6 },
  // The close. An idle loop — no entrance, just breath. Captured from t=0 for
  // the length of the closing card, so it never has to loop seamlessly.
  { tile: 'breathe', name: 'breathe', seconds: 7.5 },
];

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${HARNESS}`);

  for (const shot of SHOTS) {
    const outDir = path.join('public', 'mark', shot.name);
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    // Isolate one tile, full-bleed, no page chrome, no card.
    await page.evaluate(({ tile, ink }) => {
      document.querySelectorAll('header, .bar').forEach((el) => el.remove());
      document.querySelectorAll('.tile').forEach((t) => {
        if (!t.classList.contains(tile)) t.remove();
      });
      const t = document.querySelector('.tile');
      t.querySelectorAll('h2, code').forEach((el) => el.remove());

      const grid = document.getElementById('grid');
      Object.assign(grid.style, {
        margin: '0', padding: '0', display: 'block', maxWidth: 'none',
      });
      Object.assign(document.body.style, { margin: '0', background: 'transparent' });
      Object.assign(t.style, {
        background: 'transparent', border: 'none', borderRadius: '0',
        padding: '0', margin: '0',
      });
      const stage = t.querySelector('.stage');
      Object.assign(stage.style, {
        width: '100vw', height: '100vh', display: 'grid', placeItems: 'center',
      });
      stage.querySelector('svg').style.setProperty('--lf-ink', ink);

      // Restart the entrance so its timeline origin is now, then freeze it.
      t.classList.remove('run');
      void t.offsetWidth;
      t.classList.add('run');
      document.getAnimations().forEach((a) => a.pause());
    }, { tile: shot.tile, ink: INK });

    const total = Math.round(shot.seconds * FPS);
    for (let i = 0; i < total; i++) {
      await page.evaluate((ms) => {
        document.getAnimations().forEach((a) => {
          a.pause();
          a.currentTime = ms;
        });
      }, (i / FPS) * 1000);

      await page.screenshot({
        path: path.join(outDir, `${String(i).padStart(4, '0')}.png`),
        omitBackground: true,
      });
    }

    console.log(`  ${shot.name.padEnd(9)} ${total} frames → ${outDir}`);

    // Next shot needs the untouched harness back.
    await page.goto(`file://${HARNESS}`);
  }

  await browser.close();
};

run();
