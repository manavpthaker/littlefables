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
  '  "vocab": [{ "word": "...", "meaning": "..." }],',
  '  "retellPrompts": ["..."],',
  '  "parentGuide": null,',
  '  "originNote": null,',
  '  "chapters": [{',
  '    "title": "...",',
  '    "pages": [{ "text": "...", "star": "optional starred stem" }]',
  '  }]',
  '}',
  '',
  'Quick books have exactly 1 chapter with 8–18 pages.',
  'Chapter books have 2–4 chapters with 12–20 pages each.',
  'Each page text is 2-5 sentences, ~40-70 words.',
].join('\n');

export async function generateStory(opts: GenerateOpts): Promise<Book | null> {
  const assembled = assembleStoryPrompt({
    mode: 'start',
    child: opts.child,
    idea: opts.idea,
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
