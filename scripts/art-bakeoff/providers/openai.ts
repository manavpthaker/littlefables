/**
 * OpenAI GPT Image provider — the automatable equivalent of what the manual
 * ChatGPT session already runs under the hood. Including it is what makes the
 * bake-off answer the real question: not "is fal good", but "does ANY API
 * match what Manav gets by hand in the tab".
 *
 * Note this is separate billing from the $200/mo ChatGPT Pro plan. The plan
 * does not include API credits, so this line item is genuinely new spend —
 * unlike fal/Gemini, where nothing was being paid before either.
 *
 * Reference images require /v1/images/edits (multipart), not
 * /v1/images/generations, which takes no image input. When refs are absent we
 * fall back to generations, so a character-sheet run still works.
 */

import {
  aspectDims,
  envOrThrow,
  sleep,
  type GenerateRequest,
  type GenerateResult,
  type Provider,
} from './types';

const API_BASE = 'https://api.openai.com/v1';

/** Default model. Override with OPENAI_IMAGE_MODEL. */
const DEFAULT_MODEL = 'gpt-image-1.5';

/** 'low' | 'medium' | 'high'. Medium is the fair comparison point — it is
 *  roughly what the ChatGPT tab serves interactively. */
const DEFAULT_QUALITY = 'medium';

interface ImageApiResponse {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
}

/** OpenAI wants an explicit size string, and only accepts a fixed set. */
function sizeFor(req: GenerateRequest): string {
  const { width, height } = aspectDims(req.aspect);
  if (width === height) return '1024x1024';
  return width > height ? '1536x1024' : '1024x1536';
}

async function readImages(json: ImageApiResponse): Promise<Array<{ data: Buffer; mimeType: string }>> {
  const out: Array<{ data: Buffer; mimeType: string }> = [];
  for (const d of json.data ?? []) {
    if (d.b64_json) {
      out.push({ data: Buffer.from(d.b64_json, 'base64'), mimeType: 'image/png' });
    } else if (d.url) {
      const resp = await fetch(d.url);
      if (resp.ok) {
        out.push({
          data: Buffer.from(await resp.arrayBuffer()),
          mimeType: resp.headers.get('content-type') || 'image/png',
        });
      }
    }
  }
  return out;
}

export function openaiProvider(model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL): Provider {
  const quality = process.env.OPENAI_IMAGE_QUALITY || DEFAULT_QUALITY;

  return {
    id: `openai:${model}`,
    label: 'GPT Image',
    pricePerImageUsd: quality === 'high' ? 0.133 : quality === 'low' ? 0.009 : 0.034,
    requiredEnv: 'OPENAI_API_KEY',
    supportsRefs: true,

    async generate(req: GenerateRequest): Promise<GenerateResult> {
      const apiKey = envOrThrow('OPENAI_API_KEY');
      const started = Date.now();
      let retried = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        let resp: Response;

        if (req.refs.length > 0) {
          // Edits endpoint — multipart, refs as repeated `image[]` parts in the
          // same order the prompt describes them.
          const form = new FormData();
          form.set('model', model);
          form.set('prompt', req.prompt);
          form.set('size', sizeFor(req));
          form.set('quality', quality);
          form.set('n', '1');
          for (const r of req.refs) {
            form.append(
              'image[]',
              new Blob([new Uint8Array(r.data)], { type: r.mimeType }),
              `${r.label.replace(/[^a-z0-9._-]/gi, '-')}.${r.mimeType.includes('jpeg') ? 'jpg' : 'png'}`,
            );
          }
          resp = await fetch(`${API_BASE}/images/edits`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: form,
          });
        } else {
          resp = await fetch(`${API_BASE}/images/generations`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({
              model,
              prompt: req.prompt,
              size: sizeFor(req),
              quality,
              n: 1,
            }),
          });
        }

        if (resp.status === 429 || resp.status >= 500) {
          retried = true;
          await sleep(2000 * (attempt + 1));
          continue;
        }
        if (!resp.ok) {
          const body = await resp.text().catch(() => '');
          throw new Error(`OpenAI ${model} HTTP ${resp.status}: ${body.slice(0, 400)}`);
        }

        const json = (await resp.json()) as ImageApiResponse;
        const images = await readImages(json);
        if (images.length === 0) {
          throw new Error(`OpenAI ${model} returned no images: ${JSON.stringify(json).slice(0, 400)}`);
        }
        return {
          images,
          modelUsed: model,
          ms: Date.now() - started,
          retried,
          estimatedCostUsd: this.pricePerImageUsd * images.length,
        };
      }
      throw new Error(`OpenAI ${model} failed after 3 attempts (rate limit or 5xx)`);
    },
  };
}
