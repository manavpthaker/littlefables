/**
 * Gemini image provider — ported from little-fables/lib/art/gemini.ts, the
 * pipeline that was built and then pared back on 2026-07-29.
 *
 * Two behaviours here were paid for in debugging and are deliberately kept:
 *
 *  1. Nano Banana Pro rejects `candidateCount > 1` outright ("Multiple
 *     candidates is not enabled for this model"), so N candidates means N
 *     requests, not one request for N.
 *  2. Model ids move. Google has renamed this family twice already, so the
 *     client cascades through known ids and reports which one answered — a
 *     404 is "try the next id", not a failure.
 *
 * Reference images are sent BEFORE the text prompt. Some model variants weight
 * the leading parts more heavily, and the prompt refers to the refs by
 * position ("the FIRST N images are the character").
 */

import {
  envOrThrow,
  sleep,
  type GenerateRequest,
  type GenerateResult,
  type Provider,
} from './types';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Preferred first. Verified against ListModels, July 2026. Imagen is absent
 *  on purpose — it uses `:predict`, not `:generateContent`. */
export const GEMINI_IMAGE_MODELS = [
  'gemini-3-pro-image',
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image',
] as const;

interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
        inline_data?: { mime_type: string; data: string };
      }>;
    };
    finishReason?: string;
  }>;
  error?: { code: number; message: string; status: string };
}

function extractImages(json: GenerateContentResponse): Array<{ data: Buffer; mimeType: string }> {
  const out: Array<{ data: Buffer; mimeType: string }> = [];
  for (const c of json.candidates ?? []) {
    for (const p of c.content?.parts ?? []) {
      const inline =
        p.inlineData ??
        (p.inline_data ? { mimeType: p.inline_data.mime_type, data: p.inline_data.data } : undefined);
      if (inline && typeof inline.data === 'string') {
        out.push({ data: Buffer.from(inline.data, 'base64'), mimeType: inline.mimeType || 'image/png' });
      }
    }
  }
  return out;
}

type Attempt =
  | { ok: true; images: Array<{ data: Buffer; mimeType: string }> }
  | { ok: false; status: number; body: string };

async function tryModel(model: string, apiKey: string, req: GenerateRequest): Promise<Attempt> {
  const url = `${API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const parts: Array<Record<string, unknown>> = [];
  for (const r of req.refs) {
    parts.push({ inlineData: { mimeType: r.mimeType, data: r.data.toString('base64') } });
  }
  parts.push({ text: req.prompt });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['Image'], candidateCount: 1 },
    }),
  });

  if (!resp.ok) {
    return { ok: false, status: resp.status, body: (await resp.text().catch(() => '')).slice(0, 400) };
  }
  const json = (await resp.json()) as GenerateContentResponse;
  const images = extractImages(json);
  if (images.length === 0) {
    // A 200 with no image is usually a safety block. Surface the body — the
    // finishReason names the filter, which is the actionable part.
    return { ok: false, status: 200, body: JSON.stringify(json).slice(0, 400) };
  }
  return { ok: true, images };
}

export function geminiProvider(preferModel?: string): Provider {
  return {
    id: `gemini:${preferModel ?? GEMINI_IMAGE_MODELS[0]}`,
    label: 'Gemini (Nano Banana Pro)',
    pricePerImageUsd: 0.05,
    requiredEnv: 'GEMINI_API_KEY',
    supportsRefs: true,

    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const apiKey = envOrThrow('GEMINI_API_KEY');
      const started = Date.now();
      let retried = false;

      const order = preferModel
        ? [preferModel, ...GEMINI_IMAGE_MODELS.filter((m) => m !== preferModel)]
        : [...GEMINI_IMAGE_MODELS];

      let lastError = '';
      for (const model of order) {
        const first = await tryModel(model, apiKey, req);
        if (first.ok) {
          return {
            images: first.images,
            modelUsed: model,
            ms: Date.now() - started,
            retried,
            estimatedCostUsd: 0.05 * first.images.length,
          };
        }
        // Wrong/renamed model id, or a safety block on this variant → next id.
        if (first.status === 404 || first.status === 400 || first.status === 200) {
          lastError = `[${model} ${first.status}] ${first.body}`;
          continue;
        }
        if (first.status === 429 || first.status >= 500) {
          retried = true;
          await sleep(1500);
          const second = await tryModel(model, apiKey, req);
          if (second.ok) {
            return {
              images: second.images,
              modelUsed: model,
              ms: Date.now() - started,
              retried,
              estimatedCostUsd: 0.05 * second.images.length,
            };
          }
          lastError = `[${model} retry ${second.status}] ${second.body}`;
          continue;
        }
        // 401/403 and friends are configuration errors — fail loudly now.
        throw new Error(`Gemini ${model}: HTTP ${first.status} — ${first.body}`);
      }
      throw new Error(`All Gemini image models failed. Last: ${lastError || '(unknown)'}`);
    },
  };
}
