import { admin } from '@/lib/supabase/admin';
import { BudgetExceededError, callAnthropic, extractJson } from '@/lib/anthropic';
import { weekWindowUtc } from '@/lib/world/dates';
import type { Json } from '@/types/database';

// Weekly parent insights (brief §III.5): the "say this tomorrow" bridge line
// and the story-layers card ("Ember's Little Light quietly worked on fear of
// the dark…"). Generated once per (child, week) via lib/anthropic.ts and
// cached in parent_insights; fail-soft null — the Insights page renders
// honestly without them.

export interface StoryLayer {
  title: string;
  teaches: string;
  note: string;
}

export interface WeeklyInsights {
  bridgeLine: string | null;
  layers: StoryLayer[] | null;
}

interface GeneratedInsights {
  bridgeLine: string;
  layers: StoryLayer[];
}

export async function loadWeeklyInsights(householdId: string, childId: string): Promise<WeeklyInsights> {
  const weekStart = weekWindowUtc()[0]!;

  const { data: cached } = await admin()
    .from('parent_insights')
    .select('bridge_line, layers')
    .eq('child_id', childId)
    .eq('week_start', weekStart)
    .maybeSingle();
  if (cached) {
    return {
      bridgeLine: cached.bridge_line,
      layers: (cached.layers as StoryLayer[] | null) ?? null,
    };
  }

  // Gather this week's evidence: answered records + the books they touched.
  const weekIso = `${weekStart}T00:00:00Z`;
  const [{ data: records }, { data: progress }] = await Promise.all([
    admin()
      .from('comprehension_records')
      .select('question, question_type, transcript, judged_signal, book_id, payload')
      .eq('child_id', childId)
      .gte('asked_at', weekIso)
      .order('asked_at', { ascending: false })
      .limit(20),
    admin()
      .from('book_progress')
      .select('book_id')
      .eq('child_id', childId)
      .gte('updated_at', weekIso),
  ]);

  const bookIds = [
    ...new Set([...(records ?? []).map((r) => r.book_id), ...(progress ?? []).map((p) => p.book_id)]),
  ].filter((id): id is string => Boolean(id));
  if (bookIds.length === 0 && (records ?? []).length === 0) {
    return { bridgeLine: null, layers: null }; // nothing read this week — nothing to say
  }

  const { data: books } = await admin()
    .from('books')
    .select('id, title, parent_guide, book')
    .eq('household_id', householdId)
    .in('id', bookIds.length ? bookIds : ['-']);

  const bookLines = (books ?? []).map((b) => {
    const payload = b.book as { teachingGoals?: string[]; layerTag?: string } | null;
    return `- "${b.title}" — teaches: ${(payload?.teachingGoals ?? []).join('; ') || 'unspecified'}${payload?.layerTag ? ` (layer: ${payload.layerTag})` : ''}${b.parent_guide ? `\n  parent guide: ${b.parent_guide.slice(0, 300)}` : ''}`;
  });
  const recordLines = (records ?? []).map(
    (r) => `- [${r.question_type}/${r.judged_signal ?? 'unanswered'}] Q: ${r.question} A: ${r.transcript ?? '(none)'}`,
  );

  const system = [
    '# Role',
    'You write two things for the parent of a young child in a reading app. Honest, specific, warm — never inflated.',
    '',
    '# Output',
    'Return JSON only: {',
    '  "bridgeLine": "ONE line the parent can say to the child tomorrow, bridging a story moment into real life. Quote the story specifically. ≤ 30 words.",',
    '  "layers": [up to 3 of {"title": "book title", "teaches": "the developmental layer it worked on, ≤ 8 words", "note": "one honest sentence on whether it landed, grounded in the answers"}]',
    '}',
    'Ground every claim in the evidence. If comprehension answers show a struggle, say so plainly — parents get the truth.',
  ].join('\n');

  const user = [
    'Books read this week:',
    ...(bookLines.length ? bookLines : ['(none recorded)']),
    '',
    "This week's comprehension answers:",
    ...(recordLines.length ? recordLines : ['(none)']),
  ].join('\n');

  try {
    const raw = await callAnthropic({
      householdId,
      kind: 'respond',
      system,
      user,
      maxTokens: 400,
      temperature: 0.5,
    });
    const parsed = extractJson<GeneratedInsights>(raw);
    if (!parsed?.bridgeLine) return { bridgeLine: null, layers: null };
    const layers = Array.isArray(parsed.layers) ? parsed.layers.slice(0, 3) : null;
    await admin()
      .from('parent_insights')
      .upsert(
        {
          household_id: householdId,
          child_id: childId,
          week_start: weekStart,
          bridge_line: parsed.bridgeLine,
          layers: layers as unknown as Json,
        },
        { onConflict: 'child_id,week_start' },
      );
    return { bridgeLine: parsed.bridgeLine, layers };
  } catch (err) {
    if (!(err instanceof BudgetExceededError)) console.warn('[insights] generation failed:', err);
    return { bridgeLine: null, layers: null };
  }
}
