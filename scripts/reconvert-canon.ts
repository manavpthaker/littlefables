#!/usr/bin/env tsx
// Re-convert reference/azi-verse/source-rtf/*.rtf → lib/prompts/canon/azi-verse/*.md.
// PRD §5: the existing .md conversions dropped sections (e.g. story-creation-instructions
// lost the Project overview). Uses pandoc — a battle-tested converter that preserves
// structure the archive's converter missed.
//
// Emits a diff report (line count + first differing snippet) vs the old conversions
// so a human can eyeball recovered content.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RTF_DIR = path.resolve('reference/azi-verse/source-rtf');
const OUT_DIR = path.resolve('lib/prompts/canon/azi-verse');
const OLD_MD_DIR = path.resolve('reference/azi-verse');

// Filename → target slug. Family-authored filenames have spaces + odd casing.
const SLUGS: Record<string, string> = {
  'Azi-Verse Story Evaluation Rubric.rtf': 'evaluation-rubric.md',
  'Building a Scalable Children\'s Story Universe- Research Brief.rtf': 'scalable-universe-research.md',
  'The Azi-Verse- Updated Universe Guide.rtf': 'universe-guide.md',
  'instructions.rtf': 'story-creation-instructions.md',
  'projcet purpose.rtf': 'project-purpose.md',
  '# Future-Ready Children\'s Story Creation Knowledge .rtf': 'future-ready-skills.md',
  '# Inspirational Quotes for Story Writing.rtf': 'inspirational-quotes.md',
  '# Parent-Child Story Development Research Framework.rtf': 'parent-child-research.md',
};

function slugFor(filename: string): string | null {
  return SLUGS[filename] ?? null;
}

function convert(rtfPath: string, mdPath: string): void {
  execSync(`pandoc -f rtf -t gfm --wrap=preserve -o "${mdPath}" "${rtfPath}"`, {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

function diffReport(oldPath: string, newPath: string): string {
  if (!existsSync(oldPath)) return `  (no prior .md — full recovery)`;
  const oldLines = readFileSync(oldPath, 'utf8').split('\n').length;
  const newLines = readFileSync(newPath, 'utf8').split('\n').length;
  const delta = newLines - oldLines;
  return `  old ${oldLines} → new ${newLines} (${delta >= 0 ? '+' : ''}${delta} lines)`;
}

function main(): void {
  if (!existsSync(RTF_DIR)) throw new Error(`missing ${RTF_DIR}`);
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(RTF_DIR).filter((f) => f.endsWith('.rtf'));
  let converted = 0;
  let skipped: string[] = [];

  for (const file of files) {
    const slug = slugFor(file);
    if (!slug) {
      skipped.push(file);
      continue;
    }
    const rtfPath = path.join(RTF_DIR, file);
    const mdPath = path.join(OUT_DIR, slug);
    convert(rtfPath, mdPath);
    const oldMdPath = path.join(OLD_MD_DIR, slug);
    console.log(`✓ ${file} → ${path.relative(process.cwd(), mdPath)}`);
    console.log(diffReport(oldMdPath, mdPath));
    converted++;
  }

  if (skipped.length) {
    console.warn(`\n⚠ skipped (no slug mapping): ${skipped.join(', ')}`);
  }
  console.log(`\nConverted ${converted}/${files.length} RTF files.`);
  const totalBytes = readdirSync(OUT_DIR).reduce((n, f) => n + statSync(path.join(OUT_DIR, f)).size, 0);
  console.log(`Canon package total: ${Math.round(totalBytes / 1024)} KB`);
}

main();
