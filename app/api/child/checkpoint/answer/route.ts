import { NextResponse, type NextRequest } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import { BudgetExceededError, callAnthropic, extractJson } from '@/lib/anthropic';
import { transcribe } from '@/lib/openai';
import { assembleJudgePrompt } from '@/lib/prompts/templates/checkpoint-judge';
import { judgeSignalSchema, type JudgeSignal } from '@/lib/models/checkpoint';
import { bumpGrowth, loadWorldState } from '@/lib/world/state';
import { evaluateBadges, insertNewBadges } from '@/lib/world/badges';

// Accept the child's spoken checkpoint answer. multipart form-data:
//   recordId: uuid (the record inserted by /checkpoint/generate)
//   audio: Blob (webm/opus preferred)
//   attempt: number (1..N, kept small — the client handles mercy escalation)
// Steps: Whisper transcribe → Anthropic judge → update record → return signal.

interface JudgeResult {
  signal: JudgeSignal;
  outcome: string;
}

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'bad_form' }, { status: 400 });
  const recordId = form.get('recordId');
  const audio = form.get('audio');
  const attemptRaw = form.get('attempt');
  const attempt = typeof attemptRaw === 'string' ? Math.max(1, Math.min(5, Number(attemptRaw) || 1)) : 1;

  if (typeof recordId !== 'string' || !recordId) {
    return NextResponse.json({ error: 'missing_record' }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: 'missing_audio' }, { status: 400 });
  }

  // Load the placeholder record + verify it belongs to this child.
  const { data: record } = await admin()
    .from('comprehension_records')
    .select('id, book_id, chapter_idx, question, question_type, child_id')
    .eq('id', recordId)
    .maybeSingle();
  if (!record || record.child_id !== ctx.childId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Transcribe. Failure or budget-out → skipped signal (fail-soft PRD F3).
  let transcript = '';
  let sttFailed = false;
  try {
    transcript = (await transcribe({ householdId: ctx.householdId, audio })).trim();
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

  // Growth + badges on correct answers.
  let newlyEarned: string[] = [];
  if (signal === 'correct') {
    await bumpGrowth(ctx.childId, 'checkpointsCorrect', 1);
    const world = await loadWorldState(ctx.childId);
    const { count } = await admin()
      .from('reading_days')
      .select('day', { head: true, count: 'exact' })
      .eq('child_id', ctx.childId);
    const qualified = evaluateBadges({
      world,
      readingDaysCount: count ?? 0,
      hasSavedWord: false,
      hasCorrectCheckpoint: true,
    });
    newlyEarned = await insertNewBadges(ctx.childId, qualified);
  }

  return NextResponse.json({ signal, outcome, transcript, newlyEarned });
}
