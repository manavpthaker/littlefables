/**
 * fal.ai provider. One integration, many models — which is the whole reason
 * fal is in this bake-off. Adding a contender is a line in FAL_MODELS, not a
 * new client.
 *
 * fal's sync endpoint is https://fal.run/<model-id>, auth via `Authorization:
 * Key <FAL_KEY>`. Responses return image URLs (not inline base64), so every
 * generation costs one extra GET to pull the bytes down.
 *
 * Reference images go up as data URIs in the model's image input field. The
 * field NAME differs per model family, which is why each entry carries its own
 * `buildInput` — that variance is exactly what a shared client has to absorb.
 */

import {
  aspectDims,
  aspectRatio,
  envOrThrow,
  sleep,
  type GenerateRequest,
  type GenerateResult,
  type Provider,
} from './types';

const FAL_BASE = 'https://fal.run';

function dataUri(data: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

interface FalModelDef {
  /** fal model id used with no reference images, e.g. 'fal-ai/nano-banana-pro'. */
  modelId: string;
  /**
   * Model id used when the request carries reference images. Some families
   * split text-to-image and edit across two endpoints, and the edit one lists
   * `image_urls` as REQUIRED — so a no-ref request (the character sheet, which
   * is generated from text alone) must not be sent there. Omit when one
   * endpoint handles both, as nano-banana-pro does.
   */
  editModelId?: string;
  label: string;
  pricePerImageUsd: number;
  supportsRefs: boolean;
  buildInput(req: GenerateRequest): Record<string, unknown>;
}

/**
 * The contenders. Prices are the published per-image rates as of Aug 2026 —
 * they are for the cost column in the scoring sheet, not for billing. Verify
 * against fal's model pages before quoting them anywhere that matters.
 */
export const FAL_MODELS: Record<string, FalModelDef> = {
  'nano-banana-pro': {
    modelId: 'fal-ai/nano-banana-pro',
    label: 'Nano Banana Pro',
    pricePerImageUsd: 0.15,
    supportsRefs: true,
    buildInput: (req) => ({
      prompt: req.prompt,
      aspect_ratio: aspectRatio(req.aspect),
      num_images: 1,
      ...(req.refs.length
        ? { image_urls: req.refs.map((r) => dataUri(r.data, r.mimeType)) }
        : {}),
    }),
  },
  'flux-2-pro': {
    // Hyphens, not a slash path: fal-ai/flux-2/pro/edit 404s with
    // "Path /pro/edit not found" because the app id is `flux-2-pro`.
    modelId: 'fal-ai/flux-2-pro',
    editModelId: 'fal-ai/flux-2-pro/edit',
    label: 'FLUX.2 pro',
    // Priced per megapixel ($0.03 first MP + $0.015/extra); 1536x1024 is ~1.6MP.
    pricePerImageUsd: 0.05,
    supportsRefs: true,
    // Takes image_size, NOT aspect_ratio, and does not support num_images.
    buildInput: (req) => {
      const { width, height } = aspectDims(req.aspect);
      return {
        prompt: req.prompt,
        image_size: { width, height },
        ...(req.refs.length
          ? { image_urls: req.refs.map((r) => dataUri(r.data, r.mimeType)) }
          : {}),
      };
    },
  },
  'seedream-v4': {
    modelId: 'fal-ai/bytedance/seedream/v4/text-to-image',
    editModelId: 'fal-ai/bytedance/seedream/v4/edit',
    label: 'Seedream V4',
    pricePerImageUsd: 0.03,
    supportsRefs: true,
    buildInput: (req) => {
      const { width, height } = aspectDims(req.aspect);
      return {
        prompt: req.prompt,
        image_size: { width, height },
        num_images: 1,
        ...(req.refs.length
          ? { image_urls: req.refs.map((r) => dataUri(r.data, r.mimeType)) }
          : {}),
      };
    },
  },
  'gpt-image-2': {
    // The OpenAI arm, reached through fal. providers/openai.ts talks to
    // api.openai.com directly and needs OPENAI_API_KEY plus its own billing
    // relationship — neither of which exists on this machine. fal hosts the
    // same family, so the arm the README calls "the real question" costs one
    // entry here instead of a second account.
    //
    // BOTH ids live under the `openai/` namespace, including the text-to-image
    // one. `fal-ai/gpt-image-2` does not exist — guessing that prefix is the
    // same shape of mistake as the flux-2 404 above.
    modelId: 'openai/gpt-image-2',
    editModelId: 'openai/gpt-image-2/edit',
    label: 'GPT Image 2',
    // Interpolated, not published: fal quotes $0.219 at 1024x1024/high and
    // $0.413 at 3840x2160/high, and our landscape sits between them at 1.57MP.
    // This is the cost COLUMN, not a bill — but it is ~8x Seedream, so it is
    // the one price here worth re-checking before it lands in a doc.
    pricePerImageUsd: 0.25,
    supportsRefs: true,
    // image_size takes explicit dims (multiples of 16 — 1536x1024 qualifies).
    // Quality defaults to 'high' on both endpoints; sent explicitly anyway,
    // because the whole reason this model is in the race is its top tier.
    buildInput: (req) => {
      const { width, height } = aspectDims(req.aspect);
      return {
        prompt: req.prompt,
        image_size: { width, height },
        quality: 'high',
        num_images: 1,
        ...(req.refs.length
          ? { image_urls: req.refs.map((r) => dataUri(r.data, r.mimeType)) }
          : {}),
      };
    },
  },
};

/**
 * Which endpoint a request goes to. Refs present and an edit endpoint declared
 * → the edit one; otherwise the text-to-image one. Resolved per request, not
 * per provider, because a single run does both: sheet from text, pages from
 * the sheet.
 */
function modelIdFor(def: FalModelDef, req: GenerateRequest): string {
  return req.refs.length > 0 && def.editModelId ? def.editModelId : def.modelId;
}

interface FalResponse {
  images?: Array<{ url?: string; content_type?: string }>;
  detail?: unknown;
  error?: unknown;
}

async function downloadImage(url: string): Promise<{ data: Buffer; mimeType: string }> {
  // fal can hand back a data: URI directly on some models — handle both.
  if (url.startsWith('data:')) {
    const comma = url.indexOf(',');
    if (comma < 0) throw new Error('fal returned a malformed data: URI');
    const header = url.slice(0, comma);
    const b64 = url.slice(comma + 1);
    const mime = /^data:([^;]+)/.exec(header)?.[1] ?? 'image/png';
    return { data: Buffer.from(b64, 'base64'), mimeType: mime };
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fal image download failed: HTTP ${resp.status}`);
  const mimeType = resp.headers.get('content-type') || 'image/png';
  return { data: Buffer.from(await resp.arrayBuffer()), mimeType };
}

export function falProvider(key: keyof typeof FAL_MODELS | string): Provider {
  const def = FAL_MODELS[key];
  if (!def) {
    throw new Error(`Unknown fal model "${key}". Known: ${Object.keys(FAL_MODELS).join(', ')}`);
  }

  return {
    id: `fal:${key}`,
    label: def.label,
    pricePerImageUsd: def.pricePerImageUsd,
    requiredEnv: 'FAL_KEY',
    supportsRefs: def.supportsRefs,

    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const apiKey = envOrThrow('FAL_KEY');
      const modelId = modelIdFor(def, req);
      const started = Date.now();
      let retried = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        const resp = await fetch(`${FAL_BASE}/${modelId}`, {
          method: 'POST',
          headers: {
            Authorization: `Key ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(def.buildInput(req)),
        });

        // 429 and 5xx are transient; back off and retry. Everything else is a
        // real answer (including a content-policy refusal) and must surface.
        if (resp.status === 429 || resp.status >= 500) {
          retried = true;
          await sleep(2000 * (attempt + 1));
          continue;
        }
        if (!resp.ok) {
          const body = await resp.text().catch(() => '');
          // fal overloads 422 for two unrelated failures, and conflating them
          // points at the wrong fix. A schema mismatch means a field name is
          // wrong for this model family — buildInput's problem. A
          // content_policy_violation means the model refused the prompt itself,
          // where buildInput is irrelevant and the refusal IS the result.
          const refused = body.includes('content_policy_violation');
          const hint =
            resp.status !== 422
              ? ''
              : refused
                ? `\n  → prompt refused by this model's content checker. NOT a code bug —` +
                  `\n    ${modelId} declines to draw this page. Record it as a finding.`
                : `\n  → input schema mismatch. Fix FAL_MODELS['${key}'].buildInput in scripts/art-bakeoff/providers/fal.ts;` +
                  `\n    the accepted fields are on https://fal.ai/models/${modelId}/api`;
          throw new Error(`fal ${modelId} HTTP ${resp.status}: ${body.slice(0, 400)}${hint}`);
        }

        const json = (await resp.json()) as FalResponse;
        const urls = (json.images ?? []).map((i) => i.url).filter((u): u is string => !!u);
        if (urls.length === 0) {
          throw new Error(
            `fal ${modelId} returned no images: ${JSON.stringify(json).slice(0, 400)}`,
          );
        }
        const images = await Promise.all(urls.map(downloadImage));
        return {
          images,
          modelUsed: modelId,
          ms: Date.now() - started,
          retried,
          estimatedCostUsd: def.pricePerImageUsd * images.length,
        };
      }
      throw new Error(`fal ${modelId} failed after 3 attempts (rate limit or 5xx)`);
    },
  };
}
