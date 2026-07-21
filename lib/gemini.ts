import { admin } from '@/lib/supabase/admin';
import { BudgetExceededError } from '@/lib/anthropic';

// Thin Gemini "Nano Banana Pro" image-generation wrapper. Uses the REST API
// directly (no official SDK dep). bump_usage('art') fires BEFORE the call —
// PRD §4.6 fail-closed on money.

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

interface GeminiOpts {
  householdId: string;
  prompt: string;
  timeoutMs?: number;
}

async function bumpArt(householdId: string): Promise<void> {
  const limit = Number(process.env.ART_DAILY_LIMIT) || 30;
  const { data, error } = await admin().rpc('bump_usage', {
    p_household_id: householdId,
    p_kind: 'art',
  });
  if (error) {
    console.warn('[gemini] bump_usage failed:', error.message);
    return;
  }
  const count = typeof data === 'number' ? data : Number(data);
  if (Number.isFinite(count) && count > limit) {
    throw new BudgetExceededError('respond', count, limit); // reuses the class; kind label is nominal
  }
}

/** Generate an image. Returns raw PNG bytes on success, throws on any failure
 *  including budget exceeded. Callers persist to Supabase Storage. */
export async function generateImage(opts: GeminiOpts): Promise<Buffer> {
  await bumpArt(opts.householdId);

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is required');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: opts.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
        };
      }>;
    };
    const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
    if (!inline?.data) throw new Error('Gemini response has no image');
    return Buffer.from(inline.data, 'base64');
  } finally {
    clearTimeout(timer);
  }
}

const TEXT_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiVisionOpts {
  householdId: string;
  prompt: string;
  imageBytes: Buffer;
  mimeType: string;
  timeoutMs?: number;
}

/** Vision analysis (image + prompt → text). Same fail-closed bump_usage('art')
 *  rail as generateImage — hotspot authoring rides the art pipeline's budget. */
export async function analyzeImage(opts: GeminiVisionOpts): Promise<string> {
  await bumpArt(opts.householdId);

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is required');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);
  try {
    const res = await fetch(`${TEXT_ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { data: opts.imageBytes.toString('base64'), mimeType: opts.mimeType } },
              { text: opts.prompt },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text) throw new Error('Gemini response has no text');
    return text;
  } finally {
    clearTimeout(timer);
  }
}
