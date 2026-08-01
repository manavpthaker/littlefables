import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { requireChildDevice } from '@/lib/server/require-auth';
import { loadChildProfile } from '@/lib/server/child-settings';
import { applyPronunciations, mergePronunciations, type PronunciationMap } from '@/lib/narration/pronunciations';

// Live text-to-speech for reader narration and word taps. Routes to
// ElevenLabs. Voice selection cascade:
//   explicit voiceId  >  { voice: 'night' } NIGHT_VOICE_ID
//   > parent-set narratorVoiceId  >  DAY_VOICE_ID env  >  legacy NARRATOR_VOICE_ID
// Day/Night is a first-class mode; the client passes voice='night' when
// bedtime is active so the sleepy voice cast takes over.
//
// Model: eleven_multilingual_v2 by default (handles proper nouns and
// cultural names better than flash). Override via ELEVENLABS_MODEL_ID env.
//
// Pronunciation dictionary: content/pronunciations.json is applied to the
// text before it's sent to ElevenLabs, so "Azi" reads as "Ah-zee" without
// the caller having to know.

const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

const bodySchema = z.object({
  text: z.string().min(1).max(1000),
  voiceId: z.string().optional(),
  voice: z.enum(['day', 'night']).optional(),
});

// Load once at module init — this file is a server module so it caches.
let globalPronunciations: PronunciationMap | null = null;
function loadGlobalPronunciations(): PronunciationMap {
  if (globalPronunciations) return globalPronunciations;
  const p = path.join(process.cwd(), 'content', 'pronunciations.json');
  if (!existsSync(p)) {
    globalPronunciations = {};
    return globalPronunciations;
  }
  try {
    globalPronunciations = JSON.parse(readFileSync(p, 'utf8')) as PronunciationMap;
  } catch {
    globalPronunciations = {};
  }
  return globalPronunciations;
}

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const settings = body.data.voiceId ? null : (await loadChildProfile(ctx.childId)).settings;

  const voiceId =
    body.data.voiceId ??
    (body.data.voice === 'night'
      ? process.env.NIGHT_VOICE_ID ?? process.env.NARRATOR_VOICE_ID
      : settings?.narratorVoiceId ?? process.env.DAY_VOICE_ID ?? process.env.NARRATOR_VOICE_ID);
  if (!voiceId) return NextResponse.json({ error: 'no_voice' }, { status: 500 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'no_key' }, { status: 500 });

  const dict = mergePronunciations(loadGlobalPronunciations());
  const text = applyPronunciations(body.data.text, dict);
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
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
