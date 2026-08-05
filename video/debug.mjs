import { chromium } from 'playwright';

const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1194, height: 834 } });
const p = await c.newPage();
p.on('console', (m) => m.type() === 'error' && console.log('  console error:', m.text().slice(0, 120)));

await p.goto('http://localhost:3000/f/fAJeL9TuziaPt_3cvwNkc3vuKeNJ74yuz-zvhJEV27k', {
  waitUntil: 'networkidle',
});
console.log('landed on:', p.url());
await p.screenshot({ path: 'out/debug-shelf.png', fullPage: true });

console.log('--- visible text ---');
console.log((await p.locator('body').innerText()).slice(0, 400));

console.log('--- clickable ---');
for (const el of await p.locator('button, a').all()) {
  const t = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  const al = await el.getAttribute('aria-label');
  if (t || al) console.log(`  [${al ?? '-'}] "${t.slice(0, 60)}"`);
}

await b.close();
