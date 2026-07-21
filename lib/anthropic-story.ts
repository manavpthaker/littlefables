import { callAnthropic, extractJson } from '@/lib/anthropic';
import { assembleStoryPrompt } from '@/lib/prompts';
import { bookSchema, type Book } from '@/lib/models/book';
import type { ChildBand } from '@/lib/models/child';

// Story generation wrapper. Uses the 7-step assembly + Anthropic Sonnet (the
// heavier model — worth the cost for narrative quality). Retries once on
// invalid JSON.

interface GenerateOpts {
  householdId: string;
  child: { displayName: string; band: ChildBand; excludeTerms: string[]; pronouns?: string | null };
  idea: string;
  kind: 'quick' | 'chapter';
  /** spaced re-encounter words to weave in (PRD B5) */
  dueWords?: string[];
  /** adaptivity vocabulary density (brief §IV.3) */
  vocabDensity?: 'gentle' | 'standard' | 'rich';
}

const NARRATIVE_MODEL = 'claude-sonnet-4-6';

const OUTPUT_HINT = [
  '',
  '# 8. Return JSON only',
  'Return ONLY a JSON object matching this Book schema (no prose, no markdown fences):',
  '{',
  '  "id": "slug-with-hyphens",',
  '  "title": "Title",',
  '  "by": "Made by Papa",',
  '  "kind": "quick" | "chapter",',
  '  "source": "generated",',
  '  "status": "draft",',
  '  "coverEmoji": "🌟",',
  '  "teachingGoals": ["..."],',
  '  "layerTag": "sleep" | "feelings" | "courage" | "self",',
  '  "vocab": [{ "word": "...", "meaning": "...", "kidDefinition": "what it means, said to a 4-year-old", "syllables": ["bur", "row"] }],',
  '  "retellPrompts": ["Can you tell me the whole story of ...?"],',
  '  "beats": ["3-5 short story facts in order — the retell spine, kid-checkable"],',
  '  "parentGuide": null,',
  '  "originNote": null,',
  '  "chapters": [{',
  '    "title": "...",',
  '    "pages": [',
  '      { "text": "...", "star": "optional starred stem" },',
  '      { "text": "the story pauses here...", "choice": { "prompt": "spoken choice question", "options": [',
  '        { "label": "First path", "summary": "how the story goes if picked" },',
  '        { "label": "Second path", "summary": "how the story goes if picked" }',
  '      ]}},',
  '      { "text": "close your eyes and breathe...", "breathe": true },',
  '      { "text": "the buddy wants to hear from you", "ask": { "prompt": "what do you think?", "accept": ["any warm answer"] } }',
  '    ]',
  '  }]',
  '}',
  '',
  'Quick books have exactly 1 chapter with 8–18 pages.',
  'Chapter books have 2–4 chapters with 12–20 pages each.',
  'Each page text is 2-5 sentences, ~40-70 words.',
  '',
  'INTERACTIVITY (PRD A4): sprinkle 1-3 interactive pages per chapter — at most one choice and one breathe per chapter; asks only at natural pauses. Never make interactivity mandatory; each interactive page also has narrative text that stands on its own if skipped.',
].join('\n');

export async function generateStory(opts: GenerateOpts): Promise<Book | null> {
  const assembled = assembleStoryPrompt({
    mode: 'start',
    child: opts.child,
    idea: opts.idea,
    dueWords: opts.dueWords,
    vocabDensity: opts.vocabDensity,
  });
  const system = assembled.system + OUTPUT_HINT;

  const raw = await callAnthropic({
    householdId: opts.householdId,
    kind: 'story',
    system,
    user: assembled.user,
    model: NARRATIVE_MODEL,
    maxTokens: opts.kind === 'chapter' ? 8000 : 4000,
    temperature: 0.85,
    timeoutMs: 60_000,
  });

  const parsed = extractJson<Book>(raw);
  if (!parsed) return null;
  const validated = bookSchema.safeParse(parsed);
  return validated.success ? validated.data : null;
}
