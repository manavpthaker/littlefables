#!/usr/bin/env tsx
/**
 * Run A → B midpoint. After the buyer approves a cover style, this reads
 * the approved style anchor and the story, and emits a per-page prompt
 * bundle for the full-book ChatGPT session.
 *
 * Precondition: `previews/APPROVED-prompt.txt` must exist in the book
 * folder (paste the exact style anchor of the approved cover into it).
 * `story.json` and `character-notes.md` must also exist.
 *
 * Usage:
 *   pnpm order:full-book <intake-id> [--book <slug>] [--household-slug <slug>]
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  arg,
  fetchIntake,
  findBookFolder,
  householdSlugFromIntake,
  label,
  positional,
  type Intake,
} from './order-lib';

interface Args {
  intakeId: string;
  bookSlug?: string;
  householdSlug?: string;
}

function parseArgs(): Args {
  const intakeId = positional();
  if (!intakeId) {
    console.error('usage: pnpm order:full-book <intake-id> [--book <slug>] [--household-slug <slug>]');
    process.exit(1);
  }
  return {
    intakeId,
    bookSlug: arg('book'),
    householdSlug: arg('household-slug'),
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const intake = await fetchIntake(args.intakeId);
  console.log(`\n📥 ${label(intake)}`);

  const householdSlug = householdSlugFromIntake(intake, args.householdSlug);
  const bookDir = findBookFolder(householdSlug, args.bookSlug);
  console.log(`   book folder: ${bookDir}`);

  const approvedPath = join(bookDir, 'previews', 'APPROVED-prompt.txt');
  if (!existsSync(approvedPath)) {
    console.error(`\n⚠  Missing ${approvedPath}`);
    console.error('   Paste the exact style anchor of the approved cover into that file first.');
    process.exit(2);
  }
  const approved = readFileSync(approvedPath, 'utf8').trim();

  const storyPath = join(bookDir, 'story.json');
  const notesPath = join(bookDir, 'character-notes.md');
  for (const p of [storyPath, notesPath]) {
    if (!existsSync(p)) { console.error(`\n⚠  Missing ${p}`); process.exit(2); }
  }
  const story = JSON.parse(readFileSync(storyPath, 'utf8')) as {
    title?: string;
    chapters?: Array<{ title: string; pages: Array<{ text: string }> }>;
  };

  const out = renderFullBundle(intake, story, bookDir, approved);
  const outPath = join(bookDir, 'art-prompts-full.md');
  writeFileSync(outPath, out);
  console.log(`\n📝 ${outPath}`);
  console.log(`\nNext: paste that file into a fresh ChatGPT session (same tab/model as the`);
  console.log(`approved cover), save cover.png + pages/01.png…NN.png into ${bookDir},`);
  console.log(`then run: pnpm order:publish ${args.intakeId}`);
}

function renderFullBundle(
  intake: Intake,
  story: { title?: string; chapters?: Array<{ title: string; pages: Array<{ text: string }> }> },
  bookDir: string,
  approved: string,
): string {
  const child = intake.child_name ?? 'the child';
  const cast = intake.companions?.trim() || `Just ${child} — no other humans in the art.`;
  const relPath = bookDir.replace(process.cwd() + '/', '');
  const pages: Array<{ n: string; text: string }> = [];
  let n = 1;
  for (const ch of story.chapters ?? []) {
    for (const p of ch.pages) {
      pages.push({ n: String(n).padStart(2, '0'), text: p.text });
      n += 1;
    }
  }

  const pagePrompts = pages
    .map(
      (p) => `### pages/${p.n}.png

**Page text (for reference, do not overlay):** ${p.text}

**Prompt:** Illustrate this beat in the approved style anchor below, following the character-notes.md block for ${child} verbatim. One clear focal moment per spread. No text, no logos, no watermarks, no photorealism. Cast rule: ${cast}

**Style anchor (paste verbatim at the end of the prompt):**
> ${approved.replace(/\n/g, '\n> ')}
`,
    )
    .join('\n---\n\n');

  return `# Full-book art prompt bundle — ${child}${story.title ? ` · ${story.title}` : ''}

Paste the whole file into the same ChatGPT session and model that produced
the approved cover. Attach: \`${relPath}/story.json\`, \`${relPath}/character-notes.md\`,
\`${relPath}/reference/child-photo.jpg\` (if present), and \`${relPath}/previews/APPROVED-cover.png\`.

## Non-negotiable rules

- **Cast:** ${cast} No invented parents, coaches, siblings, or other humans.
- **Consistency:** keep the character block and style anchor **identical** across
  every page. Do not rewrite them.
- **Consistency check every 3 pages:** hair silhouette, palette, props, lighting.
  Regenerate anything off-model before continuing.
- **Save as:** \`${relPath}/cover.png\` and \`${relPath}/pages/01.png\` through
  \`${relPath}/pages/${pages.length.toString().padStart(2, '0')}.png\`.

## Cover

### cover.png

**Prompt:** Reproduce the approved cover exactly as pinned in
\`${relPath}/previews/APPROVED-cover.png\`. Do not restage or reinterpret;
match it. Save as \`${relPath}/cover.png\`.

---

## Pages (${pages.length})

${pagePrompts}
`;
}

void main().catch((err: unknown) => {
  console.error(`\n✗ ${(err as Error).message ?? err}`);
  process.exit(1);
});
