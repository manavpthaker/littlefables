/**
 * One interface, N image providers. The bake-off exists to answer a single
 * question: which provider holds a character and a style across a whole book
 * without a human checking every third page?
 *
 * So every provider must accept the same three inputs — a prompt, an ordered
 * list of reference images, and an aspect ratio — and return raw image bytes.
 * Anything a provider can't do through that interface is a finding, not a
 * reason to widen the interface.
 */

export interface RefImage {
  /** Raw bytes. Providers encode as base64 / multipart as their API requires. */
  data: Buffer;
  /** 'image/png' | 'image/jpeg' */
  mimeType: string;
  /** Human label, for debugging and the run manifest. */
  label: string;
}

export type Aspect = 'square' | 'landscape' | 'portrait';

export interface GenerateRequest {
  prompt: string;
  /**
   * ORDER IS LOAD-BEARING and every prompt builder assumes it: character
   * reference sheets first, style references after. `prompts.ts` tells the
   * model "the FIRST N images are the character" by counting from the front.
   * Reorder these and character fidelity silently degrades into style-only
   * conditioning — which looks fine on page 1 and wrong by page 8.
   */
  refs: RefImage[];
  /** How many reference images at the head of `refs` are CHARACTER refs. */
  characterRefCount: number;
  aspect: Aspect;
}

export interface GeneratedImage {
  data: Buffer;
  mimeType: string;
}

export interface GenerateResult {
  images: GeneratedImage[];
  /** The model id that actually produced the image (after any cascade). */
  modelUsed: string;
  /** Wall-clock ms for the call, including retries. */
  ms: number;
  /** True when the call retried at least once. Retries are a quality signal. */
  retried: boolean;
  /** Provider's own cost estimate in USD, when it can be derived. */
  estimatedCostUsd?: number;
}

export interface Provider {
  /** Stable id used in output paths and the manifest, e.g. 'fal:nano-banana-pro'. */
  id: string;
  /** Short human label for the scoring sheet — NEVER shown before scoring. */
  label: string;
  /** Published price per image in USD, for the cost column. */
  pricePerImageUsd: number;
  /** Env var this provider needs. Checked before a run starts, not mid-book. */
  requiredEnv: string;
  /** True if the provider accepts reference images at all. */
  supportsRefs: boolean;
  generate(req: GenerateRequest): Promise<GenerateResult>;
}

export function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Aspect → the literal ratio string most APIs want. */
export function aspectRatio(a: Aspect): string {
  return a === 'square' ? '1:1' : a === 'landscape' ? '3:2' : '2:3';
}

/** Aspect → pixel dims, for APIs that want explicit width/height. */
export function aspectDims(a: Aspect): { width: number; height: number } {
  if (a === 'square') return { width: 1024, height: 1024 };
  if (a === 'landscape') return { width: 1536, height: 1024 };
  return { width: 1024, height: 1536 };
}
