import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { BudgetExceededError } from '@/lib/anthropic';

// Live text-to-speech (buddy utterances, checkpoint questions, meanings).
// Routes to ElevenLabs with the buddy's voice_id when supplied — falls back
// to NARRATOR_VOICE_ID env. Guarded by bump_usage('tts').
//
// This route exists to unblock multi-voice per-buddy speech. The client-side
// voice-slot handler that scans data-utterance and calls this route is a
// deferred follow-up; the API is ready for it.

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
  voiceId: z.string().optional(),
  voice: z.enum(['narrator', 'buddy']).optional(),
});

async function bumpTts(householdId: string): Promise<void> {
  const limit = Number(process.env.TTS_DAILY_LIMIT) || 200;
  const { data, error } = await admin().rpc('bump_usage', {
    p_household_id: householdId,
    p_kind: 'tts',
  });
  if (error) return;
  const count = typeof data === 'number' ? data : Number(data);
  if (Number.isFinite(count) && count > limit) {
    throw new BudgetExceededError('respond', count, limit);
  }
}

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const voiceId =
    body.data.voiceId ??
    (body.data.voice === 'buddy'
      ? process.env.BUDDY_VOICE_ID
      : process.env.NARRATOR_VOICE_ID);
  if (!voiceId) return NextResponse.json({ error: 'no_voice' }, { status: 500 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'no_key' }, { status: 500 });

  try {
    await bumpTts(ctx.householdId);
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: 'budget_exceeded' }, { status: 429 });
    }
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      text: body.data.text,
      model_id: 'eleven_flash_v2_5',
      output_format: 'mp3_44100_128',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return NextResponse.json({ error: 'tts_failed', detail: detail.slice(0, 200) }, { status: 502 });
  }

  const data = (await res.json()) as {
    audio_base64: string;
    alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
    normalized_alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
  };

  return NextResponse.json({
    audioBase64: data.audio_base64,
    mimeType: 'audio/mpeg',
    alignment: data.normalized_alignment ?? data.alignment ?? null,
  });
}
