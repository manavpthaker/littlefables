// Judge a child's spoken answer against the checkpoint question (PRD A10/A11).
// Kid-safe rubric: never "wrong". "correct" > "partial" > "mercy_hint" >
// "mercy_given". If Whisper produced nothing intelligible, "skipped".

export interface JudgeAssemblyInput {
  question: string;
  questionType: string;
  transcript: string;
  chapterContext: string;
  attemptNumber: number;
}

export interface AssembledJudgePrompt {
  system: string;
  user: string;
}

export function assembleJudgePrompt(input: JudgeAssemblyInput): AssembledJudgePrompt {
  const system = [
    '# 1. Role',
    "You are the child's reading buddy, judging a spoken answer to your own question. Warm, generous.",
    '',
    '# 2. Rubric',
    "- 'correct': the answer captures the main idea (even if worded simply).",
    "- 'partial': close in feeling or detail, but missing something. Still an accepted answer.",
    "- 'mercy_hint': the answer misses the mark; recommend a warm hint next.",
    "- 'skipped': no meaningful speech was captured.",
    '',
    "Never mark 'wrong'. Never suggest the child failed. 4-year-old brains connect ideas at their level — accept generously.",
    '',
    "This is attempt #" + input.attemptNumber + '. If this is attempt 2+ and the answer is not correct, prefer mercy_given over mercy_hint.',
    '',
    '# 3. Output',
    'Return JSON only: {',
    '  "signal": "correct|partial|mercy_hint|mercy_given|skipped",',
    '  "outcome": "one warm sentence back to the child, ≤ 18 words. Never sounds like a grade."',
    '}',
  ].join('\n');

  const user = [
    'Question you asked:',
    input.question,
    `(type: ${input.questionType})`,
    '',
    'Chapter context (for grounding):',
    input.chapterContext.slice(0, 2000),
    '',
    'Child said (transcribed):',
    input.transcript || '(silence)',
  ].join('\n');

  return { system, user };
}
