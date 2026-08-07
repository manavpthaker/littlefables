#!/usr/bin/env tsx
/**
 * Run A — scaffold a new custom order for preview.
 *
 * Reads the intake row from Supabase, downloads the reference photo,
 * creates the working folder + household book folder, and emits two
 * ready-to-paste artifacts:
 *
 *   art-prompts-preview.md   — paste into a fresh ChatGPT session with the
 *                              fable-art-custom skill to generate 3 cover
 *                              variants (Style A / B / C)
 *   buyer-preview.md         — email/Etsy message with the story text and
 *                              three-cover ask. Edit in place, paste to buyer.
 *
 * Expects `story.json` + `character-notes.md` to already be authored in the
 * book folder (that's the creative step — draft with Claude, then run this).
 * If either is missing, prints where to put them and exits.
 *
 * Usage:
 *   pnpm order:preview <intake-id> [--book <slug>] [--household-slug <slug>]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  admin,
  arg,
  bookFolder,
  fetchIntake,
  householdSlugFromIntake,
  kebab,
  label,
  positional,
  signIntakePhoto,
  workingFolder,
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
    console.error('usage: pnpm order:preview <intake-id> [--book <slug>] [--household-slug <slug>]');
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
  console.log(`\n📥 Loading intake ${args.intakeId}…`);
  const intake = await fetchIntake(args.intakeId);
  console.log(`   ${label(intake)}`);

  const householdSlug = householdSlugFromIntake(intake, args.householdSlug);
  const bookSlug = args.bookSlug ?? deriveBookSlug(intake);
  console.log(`   household slug: ${householdSlug}`);
  console.log(`   book slug:      ${bookSlug}`);

  // 1. Working folder + intake snapshot (for offline reference during fulfillment).
  const working = workingFolder(intake);
  mkdirSync(join(working, 'intake'), { recursive: true });
  mkdirSync(join(working, 'previews'), { recursive: true });
  mkdirSync(join(working, 'final'), { recursive: true });
  writeFileSync(join(working, 'intake', 'intake.json'), JSON.stringify(intake, null, 2));
  console.log(`\n📁 Working folder: ${working}`);

  // 2. Reference photo. Download once into the working folder as a HEIC,
  //    convert to JPG (macOS has `sips`), and copy the JPG into the book
  //    reference/ directory (gitignored) so ChatGPT can use it directly.
  const bookDir = bookFolder(householdSlug, bookSlug);
  mkdirSync(join(bookDir, 'reference'), { recursive: true });
  mkdirSync(join(bookDir, 'pages'), { recursive: true });

  if (intake.photo_path) {
    const heicOut = join(working, 'intake', 'child-photo.heic');
    if (!existsSync(heicOut)) {
      const supa = admin();
      const { data, error } = await supa.storage.from('intake-uploads').download(intake.photo_path);
      if (error || !data) throw new Error(`photo download: ${error?.message ?? 'no data'}`);
      writeFileSync(heicOut, Buffer.from(await data.arrayBuffer()));
      console.log(`   ✓ downloaded reference photo → ${heicOut}`);
    }
    const jpgOut = join(working, 'intake', 'child-photo.jpg');
    if (!existsSync(jpgOut)) {
      const conv = spawnSync('sips', ['-s', 'format', 'jpeg', heicOut, '--out', jpgOut], { stdio: 'pipe' });
      if (conv.status !== 0) console.warn(`   · sips failed (macOS only); leaving HEIC only`);
      else console.log(`   ✓ converted → ${jpgOut}`);
    }
    const bookRef = join(bookDir, 'reference', 'child-photo.jpg');
    if (existsSync(jpgOut) && !existsSync(bookRef)) {
      writeFileSync(bookRef, readFileSync(jpgOut));
      console.log(`   ✓ seeded book reference/ (gitignored)`);
    }

    // Also refresh a signed URL so the operator can share it with Claude / ChatGPT.
    try {
      const signed = await signIntakePhoto(intake.photo_path);
      writeFileSync(join(working, 'intake', 'photo-signed-url.txt'), signed + '\n');
    } catch (err) {
      console.warn(`   · signed URL refresh failed: ${(err as Error).message}`);
    }
  } else {
    console.log(`   · no photo on intake — skipping download`);
  }

  // 3. Check the creative files exist. If not, print a clear next step.
  //    parent-guide.md is required alongside story.json and character-notes.md —
  //    it's the product, not an extra. See content/authoring-doctrine.md §5.
  const storyPath = join(bookDir, 'story.json');
  const notesPath = join(bookDir, 'character-notes.md');
  const guidePath = join(bookDir, 'parent-guide.md');
  const missing: string[] = [];
  if (!existsSync(storyPath)) missing.push('story.json');
  if (!existsSync(notesPath)) missing.push('character-notes.md');
  if (!existsSync(guidePath)) missing.push('parent-guide.md');
  if (missing.length > 0) {
    console.log(`\n⚠  Missing in ${bookDir}: ${missing.join(', ')}`);
    console.log('   Author these with Claude first — draft against:');
    console.log('     content/authoring-doctrine.md   (the doctrine)');
    console.log('     content/story-patterns.md       (match the sticky moment to a pattern)');
    console.log('     content/parent-guide-template.md (parent guide shape)');
    console.log('   Then re-run this command.');
    process.exit(2);
  }

  // 4. Emit the two artifacts.
  const promptBundlePath = join(bookDir, 'art-prompts-preview.md');
  writeFileSync(promptBundlePath, renderPreviewBundle(intake, bookSlug, bookDir));
  console.log(`\n📝 ${promptBundlePath}`);

  const buyerPacketPath = join(bookDir, 'buyer-preview.md');
  writeFileSync(buyerPacketPath, renderBuyerPacket(intake, bookSlug, storyPath));
  console.log(`📝 ${buyerPacketPath}`);

  console.log(`\nNext: paste ${promptBundlePath} into ChatGPT (fable-art-custom skill),`);
  console.log(`save the 3 covers into ${bookDir}/previews/, then edit + send buyer-preview.md.`);
}

function deriveBookSlug(intake: Intake): string {
  const child = kebab(intake.child_name) ?? 'child';
  return `${child}-book-a`;
}

function renderPreviewBundle(intake: Intake, bookSlug: string, bookDir: string): string {
  const child = intake.child_name ?? 'the child';
  const cast = intake.companions?.trim() || `Just ${child} — no other humans in the art.`;
  const relPath = bookDir.replace(process.cwd() + '/', '');
  return `# Preview art prompt bundle — ${child} · ${bookSlug}

Paste the whole file into a fresh ChatGPT session with the **fable-art-custom**
skill invoked. Also attach: \`${relPath}/story.json\`, \`${relPath}/character-notes.md\`,
and \`${relPath}/reference/child-photo.jpg\` (if present).

## Ask

**Preview mode.** Produce:

1. One character block quoted verbatim from \`character-notes.md\` (do not rewrite).
2. Three cover prompts labelled Style A, Style B, Style C, each ending with the
   character block and a distinct style anchor variation of the approved style
   in \`character-notes.md\`. Vary **only** the style anchor across A/B/C — same
   scene, same composition, same character block.
3. Then generate all three covers in this session.

## Non-negotiable rules

- **Cast:** ${cast} No invented parents, coaches, siblings, or other humans.
  Off-frame hands / arms are fine; no face beyond ${child} and any companions
  named above.
- **Save covers as:** \`${relPath}/previews/v1-cover-A.png\`,
  \`${relPath}/previews/v1-cover-B.png\`, \`${relPath}/previews/v1-cover-C.png\`.
- **Reject** any output with photorealism, text UI, watermarks, logos, or a
  human face that isn't in the cast list.

## Intake context (for the skill to weigh, not to copy)

- Child: ${child}${intake.age_years != null ? `, age ${intake.age_years}` : ''}${intake.age_band ? ` (band ${intake.age_band})` : ''}
- Interests: ${(intake.interests ?? []).join(', ') || '—'}${intake.interests_note ? ` (${intake.interests_note})` : ''}
- Traits: ${(intake.traits ?? []).join(', ') || '—'}${intake.traits_note ? ` (${intake.traits_note})` : ''}
- Inspirations: ${intake.inspirations ?? '—'}
- Look: ${intake.look ?? '—'}
- Cast: ${cast}
${intake.gift_from ? `- Gift from: ${intake.gift_from}\n` : ''}
`;
}

function renderBuyerPacket(intake: Intake, bookSlug: string, storyPath: string): string {
  const child = intake.child_name ?? 'your child';
  let storyText = '';
  let patternUsed = '';
  try {
    const story = JSON.parse(readFileSync(storyPath, 'utf8')) as {
      title?: string;
      chapters?: Array<{ pages: Array<{ text: string }> }>;
      rubric?: { pattern_used?: string; notes?: string };
    };
    if (story.title) storyText += `**${story.title}**\n\n`;
    for (const ch of story.chapters ?? []) {
      for (let i = 0; i < ch.pages.length; i++) {
        storyText += `_Page ${i + 1}._ ${ch.pages[i]!.text}\n\n`;
      }
    }
    patternUsed = story.rubric?.pattern_used ?? '';
  } catch {
    storyText = '_(story.json failed to parse — paste the story by hand below)_\n\n';
  }

  const sticky = intake.sticky_moment?.trim();
  const stickyBlock = sticky
    ? `You mentioned that this has been sticky lately:\n\n> ${sticky}\n\nThat's the seed I built the story around. ${patternUsed ? `The pattern I used comes from research on ${patternDescription(patternUsed)} — you can see it in how [name of mentor/metaphor] shows up and in the small tool the book teaches at the end.` : '[Describe the pattern in one sentence — see content/story-patterns.md for the matched pattern.]'}\n\nThe book also comes with a short **parent guide** (attached) that spells out the tool the story teaches, gives you a few key phrases to invoke in the actual next moment, and offers in-the-moment / preventive / after-the-storm scripts. That's the part of the product that keeps working after the first read.`
    : `[No sticky moment on the intake. Add a one-line hook about what makes this book specifically for ${child}.]`;

  return `# Buyer preview email — ${child} · ${bookSlug}

_Edit in place, then paste into Etsy message or Gmail. Attach v1-cover-A.png, v1-cover-B.png, v1-cover-C.png from ./previews/._

---

**Subject:** ${child}'s book — first look

Hi${intake.gift_from ? '' : ''},

Thank you for trusting me with this. Here's what I've drafted for ${child}.

## What this book is trying to do

${stickyBlock}

## The story

${storyText}
## The look

I've sketched three cover directions (attached). Each one is the same scene
in a slightly different visual register — pick whichever feels most like
${child} and I'll build the whole book in that style. Or tell me what to
change and I'll try again — as many rounds as it takes.

- **Style A** — [one-line description of A after you generate]
- **Style B** — [one-line description of B]
- **Style C** — [one-line description of C]

If any word in the story doesn't sound right for ${child}, or if the pattern
I picked isn't the sticky moment you're actually living with right now, just
say — I can change any line, or start over on a different arc.

Warmly,
[your name]
`;
}

/** Turn "story-patterns.md §1 — Big feelings that come out as hitting"
 *  into a short human phrase suitable for the buyer email. */
function patternDescription(patternUsed: string): string {
  const m = patternUsed.match(/§\d+\s*[—-]\s*(.+)$/);
  return (m?.[1] ?? patternUsed).toLowerCase();
}

void main().catch((err: unknown) => {
  console.error(`\n✗ ${(err as Error).message ?? err}`);
  process.exit(1);
});
