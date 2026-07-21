// Judge a child's spoken answer against the checkpoint question (PRD A10/A11).
// Kid-safe rubric: never "wrong". "correct" > "partial" > "mercy_hint" >
// "mercy_given". If Whisper produced nothing intelligible, "skipped".

export interface JudgeAssemblyInput {
  question: string;
  questionType: string;
  transcript: string;
  chapterContext: string;
  attemptNumber: number;
  /** authored-at-generation grounding — judge by intent-match against these, never exact words */
  expectedConcepts?: string[];
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
    'Judge by INTENT-MATCH, not exact words: a transcribed 4-year-old is messy — map what they meant onto the expected ideas. Partial credit is real credit.',
    '',
    "This is attempt #" + input.attemptNumber + '. If this is attempt 2+ and the answer is not correct, prefer mercy_given over mercy_hint.',
    '',
    '# 3. The PEER move (dialogic reading)',
    'The outcome sentence AFFIRMS what the child actually said (echo a specific word of theirs), then EXPANDS it with exactly one new idea from the story. Never just "well done".',
    '',
    '# 4. Output',
    'Return JSON only: {',
    '  "signal": "correct|partial|mercy_hint|mercy_given|skipped",',
    '  "outcome": "affirm-then-expand, one warm sentence back to the child, ≤ 18 words. Never sounds like a grade."',
    '}',
  ].join('\n');

  const userParts = [
    'Question you asked:',
    input.question,
    `(type: ${input.questionType})`,
  ];
  if (input.expectedConcepts?.length) {
    userParts.push('', 'Ideas a good answer might contain (any one is enough; synonyms count):', ...input.expectedConcepts.map((c) => `- ${c}`));
  }
  userParts.push(
    '',
    'Chapter context (for grounding):',
    input.chapterContext.slice(0, 2000),
    '',
    'Child said (transcribed):',
    input.transcript || '(silence)',
  );
  const user = userParts.join('\n');

  return { system, user };
}
