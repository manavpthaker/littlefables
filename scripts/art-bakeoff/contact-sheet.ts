/**
 * Blind contact sheet. One HTML file, no build step, opens from the filesystem.
 *
 * Layout is one ROW PER PAGE, providers side by side across the row — because
 * the thing being judged is drift, and drift is only visible when the same page
 * from every provider sits next to itself. A grid grouped by provider would
 * hide exactly what the test is for.
 *
 * The character sheet pins to the top of the page as the reference bar, so the
 * question "does page 7 still look like the sheet" never requires scrolling.
 *
 * Provider identity appears nowhere. Blind labels only.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface PageResult {
  pageIdx: number;
  file: string | null;
  ms: number;
  costUsd: number;
  retried: boolean;
  error?: string;
}

interface ProviderRun {
  blind: string;
  sheetFile: string | null;
  sheetError?: string;
  pages: PageResult[];
  totalMs: number;
  totalCostUsd: number;
  failures: number;
}

interface StoryPage {
  text: string;
  /** Sent to the model. */
  _composition?: string;
  /** Scoring note — shown here, never sent to any model. */
  _stressTest?: string;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

export function writeContactSheet(opts: {
  outDir: string;
  story: string;
  pages: StoryPage[];
  pageIdxs: number[];
  runs: ProviderRun[];
}): void {
  const { outDir, story, pages, pageIdxs, runs } = opts;
  const sorted = [...runs].sort((a, b) => a.blind.localeCompare(b.blind));
  const cols = sorted.length;

  const cell = (r: ProviderRun, idx: number): string => {
    const p = r.pages.find((x) => x.pageIdx === idx);
    if (!p) return '<div class="cell missing">not run</div>';
    if (!p.file) return `<div class="cell failed"><strong>FAILED</strong><span>${esc(p.error ?? '')}</span></div>`;
    return `<div class="cell">
      <img src="${r.blind}/${p.file}" loading="lazy" alt="page ${idx}, variant ${r.blind}">
      <div class="meta">${r.blind} · ${(p.ms / 1000).toFixed(1)}s${p.retried ? ' · retried' : ''}</div>
    </div>`;
  };

  const rows = pageIdxs
    .map((idx) => {
      const page = pages[idx];
      if (!page) return '';
      return `<section class="row">
      <header>
        <h2>Page ${idx}</h2>
        <p class="text">${esc(page.text)}</p>
        ${page._stressTest ? `<p class="dir"><strong>Stress test:</strong> ${esc(page._stressTest)}</p>` : ''}
      </header>
      <div class="grid">${sorted.map((r) => cell(r, idx)).join('')}</div>
    </section>`;
    })
    .join('\n');

  const sheetBar = sorted
    .map(
      (r) => `<div class="cell">
        ${r.sheetFile ? `<img src="${r.blind}/${r.sheetFile}" alt="character sheet ${r.blind}">` : `<div class="failed"><strong>no sheet</strong><span>${esc(r.sheetError ?? '')}</span></div>`}
        <div class="meta">${r.blind}</div>
      </div>`,
    )
    .join('');

  const summary = sorted
    .map(
      (r) => `<tr>
      <td class="blind">${r.blind}</td>
      <td>$${r.totalCostUsd.toFixed(2)}</td>
      <td>${(r.totalMs / 60000).toFixed(1)} min</td>
      <td>${r.failures}</td>
      <td>${r.pages.filter((p) => p.retried).length}</td>
    </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Art bake-off — ${esc(story)}</title>
<style>
  :root { --paper:#f4efe4; --ink:#2e2a26; --muted:#7a7166; --line:#ddd3c2; --bad:#a33; }
  @media (prefers-color-scheme: dark) {
    :root { --paper:#1c1a18; --ink:#ece5d8; --muted:#9a9184; --line:#3a352f; }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:0 0 4rem; background:var(--paper); color:var(--ink);
         font:16px/1.5 ui-serif, Georgia, serif; }
  .wrap { max-width:1600px; margin:0 auto; padding:0 1.5rem; }
  h1 { font-size:1.6rem; margin:2rem 0 .25rem; }
  .lede { color:var(--muted); margin:0 0 1.5rem; max-width:60ch; }
  .sticky { position:sticky; top:0; z-index:10; background:var(--paper);
            border-bottom:2px solid var(--line); padding:1rem 0; }
  .sticky h2 { font-size:.8rem; text-transform:uppercase; letter-spacing:.08em;
               color:var(--muted); margin:0 0 .5rem; }
  .grid { display:grid; grid-template-columns:repeat(${cols}, minmax(0,1fr)); gap:.75rem; }
  .sticky .grid img { max-height:150px; object-fit:contain; }
  .cell { display:flex; flex-direction:column; gap:.35rem; min-width:0; }
  .cell img { width:100%; height:auto; border:1px solid var(--line); border-radius:4px;
              background:#fff; display:block; }
  .meta { font:12px ui-monospace, monospace; color:var(--muted); }
  .failed, .missing { border:1px dashed var(--bad); border-radius:4px; padding:1rem;
                      color:var(--bad); font:12px ui-monospace, monospace;
                      display:flex; flex-direction:column; gap:.4rem; word-break:break-word; }
  .missing { border-color:var(--line); color:var(--muted); }
  .row { padding:2rem 0; border-bottom:1px solid var(--line); }
  .row header { margin-bottom:.9rem; }
  .row h2 { font-size:.8rem; text-transform:uppercase; letter-spacing:.08em;
            color:var(--muted); margin:0 0 .4rem; }
  .text { margin:0 0 .4rem; max-width:70ch; }
  .dir { margin:0; color:var(--muted); font-size:.85rem; max-width:70ch; }
  table { border-collapse:collapse; margin:1.5rem 0; font-size:.9rem; }
  th, td { text-align:left; padding:.4rem .9rem .4rem 0; border-bottom:1px solid var(--line); }
  th { color:var(--muted); font-weight:normal; font-size:.75rem;
       text-transform:uppercase; letter-spacing:.06em; }
  .blind { font:14px ui-monospace, monospace; font-weight:bold; }
  .note { background:rgba(200,140,40,.12); border-left:3px solid #c88c28;
          padding:.9rem 1.1rem; margin:1.5rem 0; max-width:70ch; }
</style></head>
<body><div class="wrap">
  <h1>Art bake-off — ${esc(story)}</h1>
  <p class="lede">Same story, same prompts, same reference order. Only the model differs.</p>

  <div class="note">
    <strong>Score before you unblind.</strong> Providers are shuffled behind these
    letters; the mapping is in <code>KEY.json</code>. For each column ask three
    questions, in this order:
    <ol style="margin:.5rem 0 0; padding-left:1.2rem;">
      <li><strong>Identity.</strong> Is she the same girl on page 9 as on page 0? Same face, same braids, same coat?</li>
      <li><strong>The prop.</strong> Is the brass key on its red string still there, every page she appears on? This is the one that breaks first.</li>
      <li><strong>Style.</strong> Does it still read as watercolour and ink on page 9, or has it drifted toward digital gloss?</li>
    </ol>
    A column only wins if you would have shipped every page without a regeneration.
  </div>

  <table>
    <thead><tr><th>Variant</th><th>Cost</th><th>Unattended time</th><th>Failures</th><th>Retries</th></tr></thead>
    <tbody>${summary}</tbody>
  </table>

  <div class="sticky">
    <h2>Character reference sheet — every page below was conditioned on this</h2>
    <div class="grid">${sheetBar}</div>
  </div>

${rows}
</div></body></html>`;

  writeFileSync(join(outDir, 'contact-sheet.html'), html);
}
