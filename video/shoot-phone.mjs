// Reader on a phone, against whatever LF_BASE points at.
//
//   node shoot-phone.mjs [outdir]
//
// iPhone 14 Pro logical viewport with a browser chrome allowance, because the
// reader is a dvh layout and the bug being chased only appears when the
// visible height is smaller than the window.

import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.LF_TOKEN || 'QkwroaqqCFR7XyHAzSjA6Ka-VJcWIX4e3lXP7u3Zu8I';
const BASE = process.env.LF_BASE || 'http://localhost:3000';
// Avoid apostrophes: titles render with a typographic ’ and a straight one
// will not match.
const BOOK = process.env.LF_BOOK || 'Little Bhen';
const OUT = process.argv[2] || '/tmp/phone';

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'] });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/f/${TOKEN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'library.png') });

  await page.getByText(new RegExp(BOOK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')).first().click();
  await page.waitForURL(/read\/story/, { timeout: 20000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'reader.png') });

  // Does the prose actually fit its row, or is it running under the capsule?
  const m = await page.evaluate(() => {
    const article = document.querySelector('main article');
    const pill = document.querySelector('.lf-pill');
    const p = article?.querySelector('p');
    if (!article || !pill || !p) return null;
    const a = article.getBoundingClientRect();
    const q = pill.getBoundingClientRect();
    return {
      fontSize: getComputedStyle(p).fontSize,
      lineHeight: getComputedStyle(p).lineHeight,
      articleBottom: Math.round(a.bottom),
      articleScrollH: article.scrollHeight,
      articleClientH: article.clientHeight,
      clipped: article.scrollHeight > article.clientHeight + 1,
      pillTop: Math.round(q.top),
      overlap: Math.round(a.bottom - q.top),
    };
  });
  console.log(JSON.stringify(m, null, 2));

  await browser.close();
};

run();
