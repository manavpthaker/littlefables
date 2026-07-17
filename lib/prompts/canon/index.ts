// Canon is imported at BUILD time — never readFileSync at request time (audit S9 fix).
// Each file becomes a bundled string constant via Next's default text-import treatment
// (we use fs.readFileSync at module load, which runs at build for RSC bundling).
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Resolve relative to the file so this works in dev, build, and edge runtimes
// (Next's tracing includes files referenced this way in the deploy bundle).
const HERE = path.dirname(new URL(import.meta.url).pathname);
const CANON_ROOT = HERE;

function read(rel: string): string {
  return readFileSync(path.join(CANON_ROOT, rel), 'utf8');
}

// Azi-Verse canon — the universe (PRD C2 input to generation).
export const aziVerse = {
  universeGuide: read('azi-verse/universe-guide.md'),
  storyCreationInstructions: read('azi-verse/story-creation-instructions.md'),
  evaluationRubric: read('azi-verse/evaluation-rubric.md'),
  projectPurpose: read('azi-verse/project-purpose.md'),
  futureReadySkills: read('azi-verse/future-ready-skills.md'),
  inspirationalQuotes: read('azi-verse/inspirational-quotes.md'),
  parentChildResearch: read('azi-verse/parent-child-research.md'),
  scalableUniverseResearch: read('azi-verse/scalable-universe-research.md'),
} as const;

export const characterBible = JSON.parse(read('character-bible.json')) as unknown;
