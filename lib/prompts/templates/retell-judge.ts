// Retell judging (redesign brief §IV.2 — the gold-standard rung). The child
// recounts the whole story; we map the transcript onto the authored beats
// semantically (the keyword prematch in lib/comprehension/spine.ts runs
// first; results merge). Never "wrong": the outcome names something real the
// child included, then adds ONE gentle nudge toward a missing beat.

export interface RetellJudgeInput {
  bookTitle: string;
  beats: string[];
  /** all retell turns so far, joined */
  transcript: string;
  /** beat indices already lit (keyword prematch + earlier turns) */
  alreadyHit: number[];
}

export interface AssembledRetellJudge {
  system: string;
  user: string;
}

export function assembleRetellJudgePrompt(input: RetellJudgeInput): AssembledRetellJudge {
  const system = [
    '# 1. Role',
    "You are a warm reading buddy listening to a 4-year-old retell a story. Judge which story beats the retelling covers — by MEANING, not exact words. Transcripts of small children are messy; map what they meant.",
    '',
    '# 2. Rubric',
    '- A beat counts when its idea appears in any form (synonyms, simpler words, out of order all count).',
    '- Partial credit is real credit. Be generous.',
    '- Never treat the child as wrong or incomplete.',
    '',
    '# 3. The response (PEER)',
    'outcome = one sentence, ≤ 20 words: AFFIRM by naming a specific thing the child said, then — only if a beat is missing — EXPAND with a curious nudge toward it ("And what did he do when it got dark?"). If everything is covered, celebrate the whole arc.',
    '',
    '# 4. Output',
    'Return JSON only: {',
    '  "beatsHit": [zero-based indices of beats the retelling covers],',
    '  "outcome": "the spoken sentence"',
    '}',
  ].join('\n');

  const user = [
    `Story: "${input.bookTitle}"`,
    '',
    'Story beats (zero-based):',
    ...input.beats.map((b, i) => `${i}. ${b}`),
    '',
    `Beats already counted: [${input.alreadyHit.join(', ')}]`,
    '',
    'The child said (transcribed, all turns so far):',
    input.transcript || '(silence)',
  ].join('\n');

  return { system, user };
}
