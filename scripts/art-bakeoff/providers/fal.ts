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
  /** fal model id, e.g. 'fal-ai/nano-banana-pro'. */
  modelId: string;
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
    modelId: 'fal-ai/flux-2/pro/edit',
    label: 'FLUX.2 pro',
    // Priced per megapixel ($0.03/MP); a 1536x1024 output is ~1.6MP.
    pricePerImageUsd: 0.05,
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
  'seedream-v4': {
    modelId: 'fal-ai/bytedance/seedream/v4/edit',
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
};

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
      const started = Date.now();
      let retried = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        const resp = await fetch(`${FAL_BASE}/${def.modelId}`, {
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
          throw new Error(`fal ${def.modelId} HTTP ${resp.status}: ${body.slice(0, 400)}`);
        }

        const json = (await resp.json()) as FalResponse;
        const urls = (json.images ?? []).map((i) => i.url).filter((u): u is string => !!u);
        if (urls.length === 0) {
          throw new Error(
            `fal ${def.modelId} returned no images: ${JSON.stringify(json).slice(0, 400)}`,
          );
        }
        const images = await Promise.all(urls.map(downloadImage));
        return {
          images,
          modelUsed: def.modelId,
          ms: Date.now() - started,
          retried,
          estimatedCostUsd: def.pricePerImageUsd * images.length,
        };
      }
      throw new Error(`fal ${def.modelId} failed after 3 attempts (rate limit or 5xx)`);
    },
  };
}
