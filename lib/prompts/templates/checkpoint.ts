// Comprehension checkpoint question assembly (PRD A10).
// Never test-like. Conversational. Types rotate: recall → inference →
// prediction → connection — the client passes recentTypes; we pick the least
// recent to keep the flow feeling like a chat, not a quiz.

import { aziVerse } from '../canon';
import { CANON_VERSION } from '../version';
import type { ChildBand } from '@/lib/models/child';
import type { Book } from '@/lib/models/book';

export type QuestionType = 'recall' | 'inference' | 'prediction' | 'connection';
const ALL_TYPES: QuestionType[] = ['recall', 'inference', 'prediction', 'connection'];

export interface CheckpointAssemblyInput {
  book: Pick<Book, 'title' | 'kind'>;
  chapterTitle: string;
  chapterIdx: number;
  pagesText: string; // joined chapter text
  band: ChildBand;
  recentTypes: QuestionType[]; // last N types asked, most-recent first
  savedWords: string[];
  worldSummary?: string;
}

export interface AssembledCheckpoint {
  system: string;
  user: string;
  cacheKey: string;
  requestedType: QuestionType;
}

/** Pick the type least recently asked. Deterministic tie-break. */
export function pickType(recent: QuestionType[]): QuestionType {
  if (recent.length === 0) return 'recall';
  const scored = ALL_TYPES.map((t) => {
    const idx = recent.indexOf(t);
    return { t, score: idx === -1 ? Number.POSITIVE_INFINITY : idx };
  });
  scored.sort((a, b) => b.score - a.score || ALL_TYPES.indexOf(a.t) - ALL_TYPES.indexOf(b.t));
  return scored[0]?.t ?? 'recall';
}

export function assembleCheckpointPrompt(input: CheckpointAssemblyInput): AssembledCheckpoint {
  const requestedType = pickType(input.recentTypes);

  const system = [
    '# 1. Role',
    "You are the child's warm reading buddy. Ask ONE gentle question about the chapter just read.",
    '',
    '# 2. Universe canon (for tone + character voice)',
    aziVerse.universeGuide,
    '',
    '# 3. Comprehension rubric context',
    aziVerse.evaluationRubric,
    '',
    '# 4. Hard constraints',
    `- Ask exactly one question of type: ${requestedType}.`,
    '- Conversational, warm, never quiz-like. No "what did you learn?" phrasing.',
    `- Band: ${input.band}. Match vocabulary to this level.`,
    '- Reference something specific from the chapter (a moment, a word, a feeling).',
    '- Do NOT congratulate before the child answers.',
    '',
    '# 5. Question-type meaning',
    '- recall: about something that happened.',
    "- inference: about a character's feeling or motive.",
    '- prediction: about what might come next.',
    '- connection: to the child\'s own life ("does that ever happen to you?").',
    '',
    '# 6. Output shape',
    'Return JSON only (no prose): {',
    '  "question": "the spoken question, ≤ 25 words",',
    '  "type": "recall|inference|prediction|connection",',
    '  "hint": "if the child struggles, a warm nudge ≤ 18 words",',
    '  "given": "if the child asks for the answer, the accepted phrasing ≤ 20 words — spoken as their idea"',
    '}',
    '',
    '# 7. Canon version',
    `Canon: ${CANON_VERSION}.`,
  ].join('\n');

  const userParts: string[] = [
    `Book: "${input.book.title}" (${input.book.kind})`,
    `Chapter ${input.chapterIdx + 1}: "${input.chapterTitle}"`,
    '',
    'Chapter text just read:',
    input.pagesText,
  ];
  if (input.savedWords.length) {
    userParts.push('', `Words the child has been saving lately: ${input.savedWords.join(', ')}`);
  }
  if (input.worldSummary) userParts.push('', `Reading history: ${input.worldSummary}`);

  return {
    system,
    user: userParts.join('\n'),
    cacheKey: `checkpoint|${CANON_VERSION}|${input.band}|${requestedType}`,
    requestedType,
  };
}
