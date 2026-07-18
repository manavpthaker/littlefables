import { callAnthropic, extractJson, BudgetExceededError } from '@/lib/anthropic';
import { runStage0, decideStatus, MAX_GEN_ATTEMPTS, type QAStatus } from '@/lib/prompts';
import type { Book } from '@/lib/models/book';
import type { ChildBand } from '@/lib/models/child';

// Server-persisted three-stage QA (PRD C3). Ports the archive's rubric but
// removes the "ships anyway" bug (audit S2) via decideStatus(). The C3a
// contract is enforced here — hard-gate failure on final attempt = blocked.

export interface QAResult {
  status: QAStatus;
  stage0: { passed: boolean; violations: Array<{ gate: string; detail: string }> };
  hardGates: { passed: boolean | null; violations: string[] } | null;
  softScore: { total: number; breakdown: Record<string, number> } | null;
  attempts: number;
  canonVersion: string;
  model: string;
}

interface RunOpts {
  householdId: string;
  book: Book;
  child: { band: ChildBand; excludeTerms: string[] };
  attempt: number;
}

const HARD_GATE_SYSTEM = [
  'You are a strict content-safety judge for a children\'s reading app (ages 4-8).',
  'You examine a story and return JSON only: { "passed": boolean, "violations": string[] }.',
  '',
  'HARD GATES (any triggers passed=false):',
  '- Contains graphic violence or on-page harm to a person or animal.',
  '- Contains dark/scary imagery a 4-year-old could find distressing (monsters attacking, blood, real death).',
  '- Contains adult themes (romance, sexuality, drugs, real-world political conflict).',
  '- Contains slurs, name-calling, or shaming language.',
  '- Uses vocabulary far above band 4-8 for most sentences.',
  '- Off-topic to the child\'s request in a way that would confuse them.',
  '',
  'DO NOT flag mild peril / stakes appropriate to picture books (getting lost, feeling shy, etc.).',
].join('\n');

const SOFT_RUBRIC_SYSTEM = [
  'You are a warm reading-quality reviewer for a children\'s reading app.',
  'Score the story on the 6-dimension rubric (each 0.0-1.0). Return JSON only:',
  '{ "breakdown": { "bandFit": 0..1, "emotionalResonance": 0..1, "vocabularyRichness": 0..1, "imageryAndSound": 0..1, "arcCompletion": 0..1, "invitesEngagement": 0..1 }, "total": 0..100 }',
  '',
  'Total = weighted sum × 100 with weights 0.25, 0.20, 0.15, 0.15, 0.15, 0.10 respectively.',
  'Be honest but generous; kids\' stories aren\'t novels.',
].join('\n');

function flattenStoryText(book: Book): string {
  return book.chapters
    .map((c) => `[${c.title}]\n` + c.pages.map((p) => p.text).join('\n\n'))
    .join('\n\n');
}

export async function runQA(opts: RunOpts): Promise<QAResult> {
  const model = 'claude-haiku-4-5-20251001';
  const canonVersion = 'unknown';

  // Stage 0 — deterministic (free).
  const stage0 = runStage0(opts.book, { excludeTerms: opts.child.excludeTerms });
  if (!stage0.passed) {
    return {
      status: 'blocked',
      stage0,
      hardGates: null,
      softScore: null,
      attempts: opts.attempt,
      canonVersion,
      model,
    };
  }

  // Stage 1 — hard-gate judge.
  const storyText = flattenStoryText(opts.book);
  let hardGates: QAResult['hardGates'] = null;
  try {
    const raw = await callAnthropic({
      householdId: opts.householdId,
      kind: 'score',
      system: HARD_GATE_SYSTEM,
      user: `Story text:\n\n${storyText}`,
      model,
      maxTokens: 300,
      temperature: 0.2,
    });
    const parsed = extractJson<{ passed: boolean; violations: string[] }>(raw);
    if (parsed && typeof parsed.passed === 'boolean') {
      hardGates = { passed: parsed.passed, violations: parsed.violations ?? [] };
    }
  } catch (err) {
    if (!(err instanceof BudgetExceededError)) console.warn('[qa] hard-gate failed:', err);
    hardGates = null; // audit S2 fix — never claim passed when judge unavailable
  }

  // Stage 2 — soft rubric. Only if hard gates cleared.
  let softScore: QAResult['softScore'] = null;
  if (hardGates?.passed) {
    try {
      const raw = await callAnthropic({
        householdId: opts.householdId,
        kind: 'score',
        system: SOFT_RUBRIC_SYSTEM,
        user: `Story text:\n\n${storyText}`,
        model,
        maxTokens: 400,
        temperature: 0.3,
      });
      const parsed = extractJson<{
        breakdown: Record<string, number>;
        total: number;
      }>(raw);
      if (parsed?.breakdown && typeof parsed.total === 'number') {
        softScore = { total: parsed.total, breakdown: parsed.breakdown };
      }
    } catch (err) {
      if (!(err instanceof BudgetExceededError)) console.warn('[qa] soft score failed:', err);
    }
  }

  const status = decideStatus({
    stage0Passed: stage0.passed,
    hardGatesPassed: hardGates?.passed ?? null,
    attempts: opts.attempt,
    maxAttempts: MAX_GEN_ATTEMPTS,
  });

  return {
    status,
    stage0,
    hardGates,
    softScore,
    attempts: opts.attempt,
    canonVersion,
    model,
  };
}
