// QA pipeline (PRD C3). Three stages, one source of truth for rubric weights.
// Phase 3 wires the actual model calls; this module provides the deterministic
// stage-0 and the shared contract that both /api/story and /api/story-score use
// (audit S1 fix: no duplication of scoring logic across routes).

import type { Book } from '@/lib/models/book';

export type HardGate =
  | 'excluded_term'
  | 'band_too_hard'
  | 'band_too_easy'
  | 'unsafe_content'
  | 'off_topic';

export type QAStatus = 'passed' | 'needs-review' | 'blocked' | 'unverified';

export interface Stage0Result {
  passed: boolean;
  violations: Array<{ gate: HardGate; detail: string }>;
}

export interface QAOutcome {
  status: QAStatus;
  stage0: Stage0Result;
  hardGates?: { passed: boolean; violations: string[] } | null;
  softScore?: { total: number; breakdown: Record<string, number> } | null;
  attempts: number;
}

// PRD C3 stage-0 deterministic checks. Free, must run before any judge call.
export function runStage0(book: Book, child: { excludeTerms: string[] }): Stage0Result {
  const violations: Stage0Result['violations'] = [];
  const allText = book.chapters
    .flatMap((c) => c.pages.map((p) => p.text))
    .join(' ')
    .toLowerCase();

  for (const raw of child.excludeTerms) {
    const term = raw.trim().toLowerCase();
    if (!term) continue;
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(allText)) {
      violations.push({ gate: 'excluded_term', detail: raw });
    }
  }

  return { passed: violations.length === 0, violations };
}

// PRD §7 rubric weights. ONE source of truth used by generation route + score route.
// Adjust here and both routes update in lock-step (audit S1).
export const RUBRIC_WEIGHTS = Object.freeze({
  bandFit: 0.25,
  emotionalResonance: 0.2,
  vocabularyRichness: 0.15,
  imageryAndSound: 0.15,
  arcCompletion: 0.15,
  invitesEngagement: 0.1,
} as const);
export type RubricDimension = keyof typeof RUBRIC_WEIGHTS;

// C3a contract: never ship a story that failed hard gates on the final attempt as
// 'needs-review'. It's 'blocked'. This helper is the shared decision point.
export function decideStatus(input: {
  stage0Passed: boolean;
  hardGatesPassed: boolean | null; // null = judge unavailable
  attempts: number;
  maxAttempts: number;
}): QAStatus {
  if (!input.stage0Passed) return 'blocked';
  if (input.hardGatesPassed === null) return 'unverified'; // audit S2 fix — never claim passed
  if (input.hardGatesPassed) return 'passed';
  if (input.attempts >= input.maxAttempts) return 'blocked'; // audit C3a
  return 'needs-review';
}

export const MAX_GEN_ATTEMPTS = 2;
