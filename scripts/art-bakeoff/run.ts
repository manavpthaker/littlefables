#!/usr/bin/env tsx
/**
 * Art-provider bake-off.
 *
 * The question this answers is NOT "which model makes the prettiest picture".
 * It is: which provider holds one character, one style, and one persistent prop
 * across ten pages without a human checking every third page — because that
 * check is the 30-60 attended minutes per order that `docs/commerce/gtm-decision.md`
 * measured, and it is the only cost worth automating away.
 *
 * Method, per provider:
 *   Phase 1  generate a character reference sheet from text alone
 *   Phase 2  generate all ten pages, every one conditioned on THAT SAME sheet
 *   Output   a blind contact sheet, plus a manifest with times, costs, failures
 *
 * Every provider gets a byte-identical prompt, so what varies is the model.
 *
 * Results are written BLIND: providers are shuffled behind A/B/C labels and the
 * mapping goes in KEY.json, which the contact sheet does not read. Score first,
 * unblind after — you already have a hypothesis and this is the cheap way to
 * stop it from being self-confirming.
 *
 * Usage:
 *   pnpm art:bakeoff --dry-run                     plumbing check, zero API calls
 *   pnpm art:bakeoff                               all providers with keys present
 *   pnpm art:bakeoff --providers fal:nano-banana-pro,fal:seedream-v4
 *   pnpm art:bakeoff --pages 0-3                   just the first four pages
 *
 * Env (only the providers you want need keys):
 *   FAL_KEY  OPENAI_API_KEY
 *
 * Gemini was dropped 2026-08-09 (Manav's call — not worth the integration).
 * providers/gemini.ts is kept unwired: it carries the model-cascade and
 * candidateCount quirks that were already paid for in debugging, and deleting
 * it would mean rediscovering them if Google is ever reconsidered.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { falProvider, FAL_MODELS } from './providers/fal';
import { openaiProvider } from './providers/openai';
import type { Provider, RefImage } from './providers/types';
import { characterSheetPrompt, pagePrompt, type CastMember, type StyleAnchor } from './prompts';
import { writeContactSheet } from './contact-sheet';

config({ path: '.env.local' });

const REPO_ROOT = process.cwd();
const BAKEOFF_DIR = join(REPO_ROOT, 'content', 'bakeoff');
const OUT_ROOT = join(REPO_ROOT, 'bakeoff-out');

// ---------------------------------------------------------------- args

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

const DRY_RUN = flag('dry-run');

/** "0-3" or "2" or undefined (all). */
function parsePageRange(spec: string | undefined, total: number): number[] {
  if (!spec) return Array.from({ length: total }, (_, i) => i);
  const m = /^(\d+)(?:-(\d+))?$/.exec(spec.trim());
  if (!m) throw new Error(`--pages must look like "3" or "0-4", got "${spec}"`);
  const from = Number(m[1]);
  const to = m[2] === undefined ? from : Number(m[2]);
  if (from > to || to >= total) throw new Error(`--pages ${spec} is outside 0-${total - 1}`);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

// ---------------------------------------------------------------- inputs

interface StoryPage { text: string; _composition?: string; _stressTest?: string; _offWorld?: boolean }
interface Story { id: string; title: string; chapters: Array<{ title: string; pages: StoryPage[] }> }
interface CastFile { style: StyleAnchor; cast: CastMember[]; pageCast: Record<string, string[]> }

function loadInputs(): { story: Story; pages: StoryPage[]; castFile: CastFile } {
  const storyPath = join(BAKEOFF_DIR, 'story.json');
  const castPath = join(BAKEOFF_DIR, 'cast.json');
  for (const p of [storyPath, castPath]) {
    if (!existsSync(p)) throw new Error(`missing ${p}`);
  }
  const story = JSON.parse(readFileSync(storyPath, 'utf8')) as Story;
  const castFile = JSON.parse(readFileSync(castPath, 'utf8')) as CastFile;
  const pages = story.chapters.flatMap((c) => c.pages);
  return { story, pages, castFile };
}

/** Optional style reference images — any PNG/JPG dropped in content/bakeoff/style-refs/. */
function loadStyleRefs(): RefImage[] {
  const dir = join(BAKEOFF_DIR, 'style-refs');
  if (!existsSync(dir)) return [];
  // Lazy import so a missing dir never costs a readdir.
  const { readdirSync } = require('node:fs') as typeof import('node:fs');
  return readdirSync(dir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort()
    .map((f) => ({
      data: readFileSync(join(dir, f)),
      mimeType: /\.png$/i.test(f) ? 'image/png' : 'image/jpeg',
      label: `style-${f}`,
    }));
}

// ---------------------------------------------------------------- providers

function allProviders(): Provider[] {
  return [
    ...Object.keys(FAL_MODELS).map((k) => falProvider(k)),
    openaiProvider(),
  ];
}

function selectProviders(): Provider[] {
  const spec = arg('providers');
  const all = allProviders();
  let chosen: Provider[];

  if (spec) {
    const wanted = spec.split(',').map((s) => s.trim()).filter(Boolean);
    chosen = wanted.map((w) => {
      const hit = all.find((p) => p.id === w || p.id.startsWith(`${w}:`) || p.id === `fal:${w}`);
      if (!hit) throw new Error(`Unknown provider "${w}". Known: ${all.map((p) => p.id).join(', ')}`);
      return hit;
    });
  } else {
    // No --providers: run everything whose key is actually present, and say
    // out loud which ones were skipped. A silently-skipped provider would read
    // as "it lost the bake-off".
    chosen = all.filter((p) => !!process.env[p.requiredEnv]);
    const skipped = all.filter((p) => !process.env[p.requiredEnv]);
    for (const p of skipped) console.log(`  skipping ${p.id} — ${p.requiredEnv} not set`);
  }

  if (chosen.length === 0 && !DRY_RUN) {
    throw new Error('No providers available. Set FAL_KEY / OPENAI_API_KEY, or pass --dry-run.');
  }
  return chosen;
}

/**
 * Is this failure about the account rather than the model? Billing locks and
 * auth rejections say nothing about whether a provider can hold a character,
 * so they must never be recorded as if they were a provider's score.
 */
function isInfraFailure(message: string): boolean {
  return /HTTP (401|402|403)\b|Exhausted balance|TOP_UP|User is locked|is not set/i.test(message);
}

// ---------------------------------------------------------------- blinding

/** Shuffle providers behind A/B/C so scoring can't be anchored by the label. */
function assignBlindLabels(providers: Provider[]): Map<string, string> {
  const letters = 'ABCDEFGH'.split('');
  const shuffled = [...providers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = a;
  }
  const map = new Map<string, string>();
  shuffled.forEach((p, position) => {
    map.set(p.id, letters[position] ?? `P${position}`);
  });
  return map;
}

// ---------------------------------------------------------------- run

interface PageResult {
  pageIdx: number;
  file: string | null;
  ms: number;
  costUsd: number;
  retried: boolean;
  error?: string;
}

interface ProviderRun {
  providerId: string;
  providerLabel: string;
  blind: string;
  modelUsed: string;
  sheetFile: string | null;
  sheetError?: string;
  pages: PageResult[];
  totalMs: number;
  totalCostUsd: number;
  failures: number;
}

function ext(mimeType: string): string {
  return mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
}

async function runProvider(
  provider: Provider,
  blind: string,
  ctx: {
    pages: StoryPage[];
    pageIdxs: number[];
    castFile: CastFile;
    styleRefs: RefImage[];
    outDir: string;
  },
): Promise<ProviderRun> {
  const { pages, pageIdxs, castFile, styleRefs, outDir } = ctx;
  const byId = new Map(castFile.cast.map((c) => [c.id, c]));
  const dir = join(outDir, blind);
  mkdirSync(dir, { recursive: true });

  const run: ProviderRun = {
    providerId: provider.id,
    providerLabel: provider.label,
    blind,
    modelUsed: '',
    sheetFile: null,
    pages: [],
    totalMs: 0,
    totalCostUsd: 0,
    failures: 0,
  };

  // ---- Phase 1: the character sheet, from text alone.
  const sheetPrompt = characterSheetPrompt(castFile.cast, castFile.style);
  writeFileSync(join(dir, 'prompt-sheet.txt'), sheetPrompt);

  let characterRefs: RefImage[] = [];
  try {
    console.log(`  [${blind}] character sheet…`);
    const res = await provider.generate({
      prompt: sheetPrompt,
      refs: styleRefs,
      characterRefCount: 0,
      aspect: 'landscape',
    });
    const img = res.images[0];
    if (!img) throw new Error('provider returned an empty image list');
    const file = `sheet.${ext(img.mimeType)}`;
    writeFileSync(join(dir, file), img.data);
    run.sheetFile = file;
    run.modelUsed = res.modelUsed;
    run.totalMs += res.ms;
    run.totalCostUsd += res.estimatedCostUsd ?? provider.pricePerImageUsd;
    characterRefs = [{ data: img.data, mimeType: img.mimeType, label: 'character-sheet' }];
  } catch (err) {
    // No sheet means every page below is unconditioned — that IS the result for
    // this provider, so record it and keep going rather than aborting the run.
    //
    // UNLESS the sheet died on billing or auth, which is not a result about the
    // provider at all. That distinction cost $4.50 on 2026-08-10: a balance 403
    // killed the sheet, the run carried on, and eighteen pages were generated
    // with no reference image — measuring nothing the bake-off exists to
    // measure, because "every page conditioned on that provider's own sheet"
    // IS the method. Fail loudly instead of producing plausible, worthless art.
    run.sheetError = err instanceof Error ? err.message : String(err);
    run.failures += 1;
    console.warn(`  [${blind}] character sheet FAILED: ${run.sheetError}`);
    if (isInfraFailure(run.sheetError)) {
      throw new Error(
        `${provider.id}: character sheet failed for a billing/auth reason, so every page ` +
          `would run unconditioned and the run would not measure consistency.\n` +
          `  → ${run.sheetError}\n` +
          `  Fix the account and re-run; nothing here is scoreable.`,
      );
    }
  }

  // ---- Phase 2: every page, conditioned on that one sheet.
  const refs = [...characterRefs, ...styleRefs];
  for (const idx of pageIdxs) {
    const page = pages[idx];
    if (!page) continue;
    const presentIds = castFile.pageCast[String(idx)] ?? [];
    const present = presentIds.map((id) => byId.get(id)).filter((c): c is CastMember => !!c);
    const prompt = pagePrompt({
      pageText: page.text,
      prevText: idx > 0 ? pages[idx - 1]?.text : undefined,
      cast: castFile.cast,
      present,
      style: castFile.style,
      characterRefCount: characterRefs.length,
      direction: page._composition,
      offWorld: page._offWorld,
    });
    writeFileSync(join(dir, `page-${String(idx).padStart(2, '0')}.prompt.txt`), prompt);

    try {
      console.log(`  [${blind}] page ${idx}…`);
      const res = await provider.generate({ prompt, refs, characterRefCount: characterRefs.length, aspect: 'landscape' });
      const img = res.images[0];
      if (!img) throw new Error('provider returned an empty image list');
      const file = `page-${String(idx).padStart(2, '0')}.${ext(img.mimeType)}`;
      writeFileSync(join(dir, file), img.data);
      const cost = res.estimatedCostUsd ?? provider.pricePerImageUsd;
      run.pages.push({ pageIdx: idx, file, ms: res.ms, costUsd: cost, retried: res.retried });
      run.totalMs += res.ms;
      run.totalCostUsd += cost;
      if (!run.modelUsed) run.modelUsed = res.modelUsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      run.pages.push({ pageIdx: idx, file: null, ms: 0, costUsd: 0, retried: false, error: message });
      run.failures += 1;
      console.warn(`  [${blind}] page ${idx} FAILED: ${message}`);
    }
  }

  return run;
}

// ---------------------------------------------------------------- main

async function main(): Promise<void> {
  const { story, pages, castFile } = loadInputs();
  const pageIdxs = parsePageRange(arg('pages'), pages.length);
  const styleRefs = loadStyleRefs();
  const providers = selectProviders();

  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = join(OUT_ROOT, runId);

  console.log(`\nBake-off "${story.title}" — ${pageIdxs.length} pages x ${providers.length} providers`);
  console.log(`Style refs: ${styleRefs.length || 'none (text-only style anchor)'}`);
  const estimate = providers.reduce((sum, p) => sum + p.pricePerImageUsd * (pageIdxs.length + 1), 0);
  console.log(`Estimated cost: $${estimate.toFixed(2)}`);
  console.log(`Output: bakeoff-out/${runId}/\n`);

  if (DRY_RUN) {
    // Prove the plumbing without spending anything: write every prompt exactly
    // as it would be sent, so the prompts themselves can be reviewed first.
    mkdirSync(outDir, { recursive: true });
    const byId = new Map(castFile.cast.map((c) => [c.id, c]));
    writeFileSync(join(outDir, 'prompt-sheet.txt'), characterSheetPrompt(castFile.cast, castFile.style));
    for (const idx of pageIdxs) {
      const presentIds = castFile.pageCast[String(idx)] ?? [];
      writeFileSync(
        join(outDir, `page-${String(idx).padStart(2, '0')}.prompt.txt`),
        pagePrompt({
          pageText: pages[idx]?.text ?? '',
          prevText: idx > 0 ? pages[idx - 1]?.text : undefined,
          cast: castFile.cast,
          present: presentIds.map((id) => byId.get(id)).filter((c): c is CastMember => !!c),
          style: castFile.style,
          characterRefCount: 1,
          direction: pages[idx]?._composition,
          offWorld: pages[idx]?._offWorld,
        }),
      );
    }
    console.log(`DRY RUN — wrote ${pageIdxs.length + 1} prompts to bakeoff-out/${runId}/. No API calls, no spend.`);
    console.log(`Providers that would run: ${providers.map((p) => p.id).join(', ') || '(none — no keys set)'}`);
    return;
  }

  mkdirSync(outDir, { recursive: true });
  const blindMap = assignBlindLabels(providers);
  const runs: ProviderRun[] = [];

  for (const provider of providers) {
    const blind = blindMap.get(provider.id)!;
    console.log(`\n${provider.id} → blind label ${blind}`);
    runs.push(await runProvider(provider, blind, { pages, pageIdxs, castFile, styleRefs, outDir }));
  }

  // The unblinding key, kept in its own file the contact sheet never reads.
  writeFileSync(
    join(outDir, 'KEY.json'),
    JSON.stringify(
      {
        _warning: 'Score the contact sheet FIRST. Open this only afterwards.',
        runId,
        mapping: runs.map((r) => ({ blind: r.blind, provider: r.providerId, label: r.providerLabel, model: r.modelUsed })),
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify({ runId, story: story.title, pages: pageIdxs, runs }, null, 2),
  );

  writeContactSheet({ outDir, story: story.title, pages, pageIdxs, runs });

  console.log('\n--- run complete ---');
  for (const r of runs) {
    const mins = (r.totalMs / 60000).toFixed(1);
    console.log(
      `  ${r.blind}: $${r.totalCostUsd.toFixed(2)} · ${mins} min unattended · ${r.failures} failure(s)`,
    );
  }
  console.log(`\nScore it:   open bakeoff-out/${runId}/contact-sheet.html`);
  console.log(`Unblind:    cat bakeoff-out/${runId}/KEY.json   (AFTER scoring)`);
}

main().catch((err) => {
  console.error(`\nbake-off failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
