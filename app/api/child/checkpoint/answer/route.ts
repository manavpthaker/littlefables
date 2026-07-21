import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import { BudgetExceededError, callAnthropic, extractJson } from '@/lib/anthropic';
import { transcribe } from '@/lib/openai';
import { assembleJudgePrompt } from '@/lib/prompts/templates/checkpoint-judge';
import { fallbackChoiceSchema, judgeSignalSchema, type JudgeSignal } from '@/lib/models/checkpoint';
import { bumpGrowth, loadWorldState } from '@/lib/world/state';
import { evaluateBadges, insertNewBadges } from '@/lib/world/badges';
import { markOwnershipFromTranscript } from '@/lib/world/word-ownership';

// Accept the child's checkpoint answer, two ways:
//   multipart form-data (voice): recordId, audio Blob, attempt
//   application/json (tap fallback): { recordId, choiceIdx }
// Voice: Whisper transcribe → Anthropic judge (grounded in the generated
// expectedConcepts) → update record → return signal. Tap: deterministic —
// the best choice is correct, any other is partial (never "wrong").

interface JudgeResult {
  signal: JudgeSignal;
  outcome: string;
}

const choiceBodySchema = z.object({
  recordId: z.string().uuid(),
  choiceIdx: z.number().int().min(0).max(3),
});

const payloadSchema = z
  .object({
    expectedConcepts: z.array(z.string()).default([]),
    fallbackChoices: z.array(fallbackChoiceSchema).default([]),
  })
  .passthrough();

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const contentType = request.headers.get('content-type') ?? '';

  let recordId: string;
  let audio: Blob | null = null;
  let choiceIdx: number | null = null;
  let attempt = 1;

  if (contentType.includes('application/json')) {
    const body = choiceBodySchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    recordId = body.data.recordId;
    choiceIdx = body.data.choiceIdx;
  } else {
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: 'bad_form' }, { status: 400 });
    const rawRecordId = form.get('recordId');
    const rawAudio = form.get('audio');
    const attemptRaw = form.get('attempt');
    attempt = typeof attemptRaw === 'string' ? Math.max(1, Math.min(5, Number(attemptRaw) || 1)) : 1;

    if (typeof rawRecordId !== 'string' || !rawRecordId) {
      return NextResponse.json({ error: 'missing_record' }, { status: 400 });
    }
    if (!(rawAudio instanceof Blob) || rawAudio.size === 0) {
      return NextResponse.json({ error: 'missing_audio' }, { status: 400 });
    }
    recordId = rawRecordId;
    audio = rawAudio;
  }

  // Load the placeholder record + verify it belongs to this child.
  const { data: record } = await admin()
    .from('comprehension_records')
    .select('id, book_id, chapter_idx, question, question_type, child_id, payload')
    .eq('id', recordId)
    .maybeSingle();
  if (!record || record.child_id !== ctx.childId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const payload = payloadSchema.safeParse(record.payload ?? {});
  const expectedConcepts = payload.success ? payload.data.expectedConcepts : [];
  const fallbackChoices = payload.success ? payload.data.fallbackChoices : [];

  // Tap-choice fallback (brief §IV.2): deterministic, warm, never "wrong".
  if (choiceIdx !== null) {
    const picked = fallbackChoices[choiceIdx];
    if (!picked) return NextResponse.json({ error: 'bad_choice' }, { status: 400 });
    const signal: JudgeSignal = picked.best ? 'correct' : 'partial';
    const outcome = picked.best
      ? `Yes — ${picked.label.toLowerCase()}. You were really listening!`
      : `Mmm, ${picked.label.toLowerCase()} — that's part of the story too.`;
    await admin()
      .from('comprehension_records')
      .update({ transcript: `(tapped) ${picked.label}`, judged_signal: signal })
      .eq('id', recordId);
    let newlyEarned: string[] = [];
    if (signal === 'correct') newlyEarned = await awardCorrect(ctx.childId);
    return NextResponse.json({ signal, outcome, transcript: picked.label, newlyEarned });
  }

  // Transcribe. Failure or budget-out → skipped signal (fail-soft PRD F3).
  let transcript = '';
  let sttFailed = false;
  try {
    transcript = (await transcribe({ householdId: ctx.householdId, audio: audio! })).trim();
  } catch (err) {
    sttFailed = true;
    if (!(err instanceof BudgetExceededError)) console.warn('[checkpoint/answer] Whisper failed:', err);
  }

  // Judge. Same fail-soft posture.
  let signal: JudgeSignal = sttFailed || !transcript ? 'skipped' : 'partial';
  let outcome = "That's a lovely idea.";
  if (transcript && !sttFailed) {
    try {
      // Fetch chapter text for grounding.
      const { data: bookRow } = await admin()
        .from('books')
        .select('book')
        .eq('id', record.book_id ?? '')
        .maybeSingle();
      const chapterText =
        bookSchema.safeParse(bookRow?.book).success
          ? bookSchema
              .parse(bookRow!.book)
              .chapters[record.chapter_idx ?? 0]?.pages.map((p) => p.text)
              .join('\n\n') ?? ''
          : '';
      const assembled = assembleJudgePrompt({
        question: record.question,
        questionType: record.question_type,
        transcript,
        chapterContext: chapterText,
        attemptNumber: attempt,
        expectedConcepts,
      });
      const raw = await callAnthropic({
        householdId: ctx.householdId,
        kind: 'score',
        system: assembled.system,
        user: assembled.user,
        maxTokens: 200,
        temperature: 0.3,
      });
      const parsed = extractJson<JudgeResult>(raw);
      if (parsed?.signal) {
        const sig = judgeSignalSchema.safeParse(parsed.signal);
        if (sig.success) signal = sig.data;
      }
      if (parsed?.outcome) outcome = parsed.outcome;
    } catch (err) {
      if (!(err instanceof BudgetExceededError)) console.warn('[checkpoint/answer] judge failed:', err);
    }
  }

  // Update the record.
  await admin()
    .from('comprehension_records')
    .update({ transcript: transcript || null, judged_signal: signal })
    .eq('id', recordId);

  // Growth + badges on correct answers; word ownership (PRD B5) on any
  // understood answer — a saved word he used himself just got its star.
  let newlyEarned: string[] = [];
  if (signal === 'correct') newlyEarned = await awardCorrect(ctx.childId);
  if (signal === 'correct' || signal === 'partial') {
    void markOwnershipFromTranscript(ctx.childId, transcript);
  }

  return NextResponse.json({ signal, outcome, transcript, newlyEarned });
}

async function awardCorrect(childId: string): Promise<string[]> {
  await bumpGrowth(childId, 'checkpointsCorrect', 1);
  const world = await loadWorldState(childId);
  const { count } = await admin()
    .from('reading_days')
    .select('day', { head: true, count: 'exact' })
    .eq('child_id', childId);
  const qualified = evaluateBadges({
    world,
    readingDaysCount: count ?? 0,
    hasSavedWord: false,
    hasCorrectCheckpoint: true,
  });
  return insertNewBadges(childId, qualified);
}
