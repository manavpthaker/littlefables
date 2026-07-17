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
  const cacheKey = `story|${CANON_VERSION}|${input.mode}|${input.child.band}`;

  return { system, user, cacheKey, canonVersion: CANON_VERSION };
}
