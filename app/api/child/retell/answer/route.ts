import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { BudgetExceededError, callAnthropic, extractJson } from '@/lib/anthropic';
import { transcribe } from '@/lib/openai';
import { assembleRetellJudgePrompt } from '@/lib/prompts/templates/retell-judge';
import { matchBeats, mergeHits } from '@/lib/comprehension/spine';
import { markOwnershipFromTranscript } from '@/lib/world/word-ownership';
import type { JudgeSignal } from '@/lib/models/checkpoint';
import type { Json } from '@/types/database';

// One retell turn (brief §IV.2): the child speaks, the spine lights up.
// Multi-turn — transcripts accumulate on the record until the child is done.
// Beat matching = keyword prematch ∪ semantic judge (both generous); audio
// lands in the private retells bucket + the retells table (PRD A5/D9).

const payloadSchema = z
  .object({
    beats: z.array(z.string()).default([]),
    beatsHit: z.array(z.number().int().min(0)).default([]),
  })
  .passthrough();

interface RetellJudgeResult {
  beatsHit: number[];
  outcome: string;
}

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'bad_form' }, { status: 400 });
  const recordId = form.get('recordId');
  const audio = form.get('audio');
  if (typeof recordId !== 'string' || !recordId) {
    return NextResponse.json({ error: 'missing_record' }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: 'missing_audio' }, { status: 400 });
  }

  const { data: record } = await admin()
    .from('comprehension_records')
    .select('id, child_id, book_id, question, transcript, payload')
    .eq('id', recordId)
    .eq('question_type', 'retell')
    .maybeSingle();
  if (!record || record.child_id !== ctx.childId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const payload = payloadSchema.safeParse(record.payload ?? {});
  const beats = payload.success ? payload.data.beats : [];
  const priorHits = payload.success ? payload.data.beatsHit : [];

  // Transcribe this turn (fail-soft: silence just doesn't light beats).
  let turnTranscript = '';
  try {
    turnTranscript = (await transcribe({ householdId: ctx.householdId, audio })).trim();
  } catch (err) {
    if (!(err instanceof BudgetExceededError)) console.warn('[retell/answer] Whisper failed:', err);
  }
  const fullTranscript = [record.transcript, turnTranscript].filter(Boolean).join(' ').trim();

  // Keyword prematch, then the semantic judge; hits merge (both generous).
  let hits = mergeHits(priorHits, matchBeats(fullTranscript, beats));
  let outcome = turnTranscript
    ? 'What a story you told!'
    : "I couldn't quite hear that one — want to try again?";
  if (turnTranscript && beats.length) {
    try {
      const { data: bookRow } = await admin()
        .from('books')
        .select('title')
        .eq('id', record.book_id ?? '')
        .maybeSingle();
      const assembled = assembleRetellJudgePrompt({
        bookTitle: bookRow?.title ?? 'the story',
        beats,
        transcript: fullTranscript,
        alreadyHit: hits,
      });
      const raw = await callAnthropic({
        householdId: ctx.householdId,
        kind: 'score',
        system: assembled.system,
        user: assembled.user,
        maxTokens: 250,
        temperature: 0.3,
      });
      const parsed = extractJson<RetellJudgeResult>(raw);
      if (parsed) {
        if (Array.isArray(parsed.beatsHit)) {
          hits = mergeHits(hits, parsed.beatsHit.filter((i) => Number.isInteger(i) && i >= 0 && i < beats.length));
        }
        if (parsed.outcome) outcome = parsed.outcome;
      }
    } catch (err) {
      if (!(err instanceof BudgetExceededError)) console.warn('[retell/answer] judge failed:', err);
    }
  }

  // Store audio in the private retells bucket (path: <child_id>/<file>) and
  // upsert the retells row (PRD D9 — parent-visible, deletable).
  const audioPath = `${ctx.childId}/${recordId}-${Date.now()}.webm`;
  const bytes = Buffer.from(await audio.arrayBuffer());
  const { error: upErr } = await admin()
    .storage.from('retells')
    .upload(audioPath, bytes, { contentType: audio.type || 'audio/webm', upsert: true });
  if (!upErr) {
    await admin()
      .from('retells')
      .upsert(
        {
          id: recordId,
          child_id: ctx.childId,
          book_id: record.book_id,
          audio_path: audioPath,
          transcript: fullTranscript || null,
          mime_type: audio.type || 'audio/webm',
        },
        { onConflict: 'id' },
      );
  }

  // Signal reflects spine coverage so far; every turn updates it.
  const signal: JudgeSignal =
    beats.length === 0
      ? fullTranscript
        ? 'correct'
        : 'skipped'
      : hits.length === beats.length
        ? 'correct'
        : hits.length > 0
          ? 'partial'
          : fullTranscript
            ? 'mercy_hint'
            : 'skipped';

  await admin()
    .from('comprehension_records')
    .update({
      transcript: fullTranscript || null,
      judged_signal: signal,
      payload: { beats, beatsHit: hits } as unknown as Json,
    })
    .eq('id', recordId);

  if (fullTranscript) void markOwnershipFromTranscript(ctx.childId, fullTranscript);

  return NextResponse.json({
    beatsHit: hits,
    beatsTotal: beats.length,
    outcome,
    transcript: turnTranscript,
    done: beats.length > 0 && hits.length === beats.length,
  });
}
