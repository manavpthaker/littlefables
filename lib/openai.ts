import OpenAI from 'openai';
import { admin } from '@/lib/supabase/admin';
import { BudgetExceededError } from './anthropic';

// Thin OpenAI wrapper for Whisper transcription. bump_usage BEFORE the API
// call (PRD §4.6 fail-closed on money).

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (cached) return cached;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is required');
  cached = new OpenAI({ apiKey: key });
  return cached;
}

function dailyLimit(): number {
  const env = process.env.LISTEN_DAILY_LIMIT;
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

async function bumpListen(householdId: string): Promise<void> {
  const limit = dailyLimit();
  // Fail-CLOSED per PRD §4.6: retry once, then throw BudgetExceededError so
  // the paid Whisper call is not made on an unmetered path.
  let lastErr: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await admin().rpc('bump_usage', {
      p_household_id: householdId,
      p_kind: 'listen',
    });
    if (!error) {
      const count = typeof data === 'number' ? data : Number(data);
      if (Number.isFinite(count) && count > limit) {
        throw new BudgetExceededError('listen', count, limit);
      }
      return;
    }
    lastErr = error.message;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 200));
  }
  console.warn('[openai] bump_usage failed after 2 attempts:', lastErr);
  throw new BudgetExceededError('listen', -1, limit);
}

export interface TranscribeOptions {
  householdId: string;
  audio: Blob | File;
  filename?: string;
  language?: string;
  timeoutMs?: number;
}

export async function transcribe(opts: TranscribeOptions): Promise<string> {
  await bumpListen(opts.householdId);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);
  try {
    // OpenAI SDK accepts File-like input. In Node, wrap the Blob to be sure.
    const audioFile =
      opts.audio instanceof File
        ? opts.audio
        : new File([opts.audio], opts.filename ?? 'audio.webm', {
            type: opts.audio.type || 'audio/webm',
          });
    const res = await client().audio.transcriptions.create(
      {
        file: audioFile,
        model: 'whisper-1',
        language: opts.language ?? 'en',
      },
      { signal: controller.signal },
    );
    return res.text ?? '';
  } finally {
    clearTimeout(timer);
  }
}
