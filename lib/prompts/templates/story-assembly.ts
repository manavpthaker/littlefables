// Story-generation prompt assembly. Ported from archive `app/api/story/route.ts`
// (the 7-step labeled contract), extracted stateless. Canon is imported at build
// time via lib/prompts/canon/index.ts (audit S9 fix — no runtime readFileSync of docs).
//
// Phase 3 wires this to the /api/story route + Anthropic client + QA gates.

import { aziVerse } from '../canon';
import { CANON_VERSION } from '../version';
import type { ChildBand } from '@/lib/models/child';
import type { Book } from '@/lib/models/book';

export type StoryMode = 'start' | 'chapter' | 'continue';

export interface AssemblyInput {
  mode: StoryMode;
  child: {
    displayName: string;
    band: ChildBand;
    excludeTerms: string[];
    pronouns?: string | null;
  };
  idea: string;
  priorChapters?: Book['chapters'];
  worldStateSummary?: string;
  childIdea?: string;
  comprehensionSummary?: string;
  savedWords?: string[];
  /** spaced re-encounter words (PRD B5) — weave 2-3 in naturally, never as a list */
  dueWords?: string[];
  /** adaptivity vocabulary density (brief §IV.3): gentle | standard | rich */
  vocabDensity?: 'gentle' | 'standard' | 'rich';
}

export interface AssembledPrompt {
  system: string;
  user: string;
  cacheKey: string;
  canonVersion: string;
}

// PRD C2: 7-step labeled contract. Keep step labels stable — they're what the
// model reads. Cache-key is a stable string so Anthropic prompt caching hits.
export function assembleStoryPrompt(input: AssemblyInput): AssembledPrompt {
  const system = [
    '# 1. Role',
    'You are the Azi-Verse story engine for Little Fables — a warm, honest picture-book author for a specific child.',
    '',
    '# 2. Universe canon',
    aziVerse.universeGuide,
    '',
    '# 3. Story creation instructions',
    aziVerse.storyCreationInstructions,
    '',
    '# 4. Evaluation rubric (self-check as you write)',
    aziVerse.evaluationRubric,
    '',
    '# 5. Hard constraints (deterministic gates will reject violations)',
    `- Child band: ${input.child.band}. Match vocabulary, sentence length, and sensory complexity to this band.`,
    input.child.excludeTerms.length
      ? `- Exclude terms (HARD): ${input.child.excludeTerms.join(', ')}. Never use these words or paraphrases.`
      : '- No child-specific excluded terms.',
    densityLine(input.vocabDensity),
    '',
    '# 6. Output shape',
    'Return valid JSON matching the Book schema: { title, kind, chapters:[{title, pages:[{text, star?}]}] }.',
    '',
    '# 7. Canon version',
    `Canon: ${CANON_VERSION}. Mode: ${input.mode}.`,
  ].join('\n');

  const userParts: string[] = [
    `Child: ${input.child.displayName}${input.child.pronouns ? ` (${input.child.pronouns})` : ''}, band ${input.child.band}.`,
    `Idea: ${input.idea}`,
  ];
  if (input.worldStateSummary) userParts.push(`World state so far: ${input.worldStateSummary}`);
  if (input.comprehensionSummary) userParts.push(`Comprehension profile: ${input.comprehensionSummary}`);
  if (input.savedWords?.length) userParts.push(`Saved words to weave in naturally: ${input.savedWords.join(', ')}`);
  if (input.dueWords?.length) userParts.push(`Re-encounter words (it's time these came back — use 2-3 of them naturally in the prose): ${input.dueWords.join(', ')}`);
  if (input.mode === 'chapter' && input.priorChapters?.length) {
    const summary = input.priorChapters
      .map((c, i) => `Ch${i + 1} "${c.title}" (${c.pages.length}p)`)
      .join('; ');
    userParts.push(`Prior chapters: ${summary}`);
  }
  if (input.mode === 'continue' && input.childIdea) {
    userParts.push(`Child's chosen idea: ${input.childIdea}`);
  }

  const user = userParts.join('\n\n');
  const cacheKey = `story|${CANON_VERSION}|${input.mode}|${input.child.band}|${input.vocabDensity ?? 'standard'}`;

  return { system, user, cacheKey, canonVersion: CANON_VERSION };
}

// Adaptivity vocabulary density (brief §II.2 rare-word exposure + §IV.3):
// deliberately sophisticated words are the collectable targets — density
// tunes how many, never whether the story is warm.
function densityLine(density?: 'gentle' | 'standard' | 'rich'): string {
  switch (density) {
    case 'gentle':
      return '- Vocabulary density: GENTLE. Mostly familiar words; one gently new word per chapter, always self-explained by context.';
    case 'rich':
      return '- Vocabulary density: RICH. 2-3 deliberately sophisticated words per chapter (vast, furious, gentle territory) — each one a collectable star candidate, meaning inferable from context.';
    default:
      return '- Vocabulary density: STANDARD. 1-2 gently sophisticated words per chapter, meaning inferable from context.';
  }
}
