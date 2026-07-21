import Anthropic from '@anthropic-ai/sdk';
import { admin } from '@/lib/supabase/admin';

// Thin Anthropic wrapper. Calls bump_usage BEFORE the API call (PRD §4.6 —
// fail closed on money). If the budget is exceeded, throws a typed error so
// the route can return a canned fallback (fail soft on joy for the kid).

export type UsageKind = 'respond' | 'story' | 'score' | 'listen';

let cached: Anthropic | null = null;
function client(): Anthropic {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is required');
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export class BudgetExceededError extends Error {
  constructor(readonly kind: UsageKind, readonly count: number, readonly limit: number) {
    super(`daily ${kind} budget reached: ${count}/${limit}`);
    this.name = 'BudgetExceededError';
  }
}

function dailyLimit(kind: UsageKind): number {
  const env = process.env[`${kind.toUpperCase()}_DAILY_LIMIT`];
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? n : 40;
}

async function bumpUsage(householdId: string, kind: UsageKind): Promise<void> {
  const limit = dailyLimit(kind);
  // Fail-CLOSED on RPC error per PRD §4.6: two attempts (with 200ms backoff)
  // then throw. The previous "log and continue" was fail-OPEN and turned
  // every Supabase blip into an unmetered paid call — comment inside the
  // function claimed the opposite of what the code did. Kid-facing fallback
  // stays soft (routes catch BudgetExceededError → canned reply); money is
  // hard-stopped.
  let lastErr: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await admin().rpc('bump_usage', {
      p_household_id: householdId,
      p_kind: kind,
    });
    if (!error) {
      const count = typeof data === 'number' ? data : Number(data);
      if (Number.isFinite(count) && count > limit) {
        throw new BudgetExceededError(kind, count, limit);
      }
      return;
    }
    lastErr = error.message;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 200));
  }
  console.warn(`[anthropic] bump_usage failed after 2 attempts (${kind}):`, lastErr);
  throw new BudgetExceededError(kind, -1, limit);
}

export interface CallOpts {
  householdId: string;
  kind: UsageKind;
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  cacheKey?: string;
  timeoutMs?: number;
}

export async function callAnthropic(opts: CallOpts): Promise<string> {
  await bumpUsage(opts.householdId, opts.kind);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);

  try {
    const message = await client().messages.create(
      {
        model: opts.model ?? 'claude-haiku-4-5-20251001',
        max_tokens: opts.maxTokens ?? 400,
        temperature: opts.temperature ?? 0.7,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      },
      { signal: controller.signal },
    );
    const block = message.content[0];
    if (!block || block.type !== 'text') return '';
    return block.text;
  } finally {
    clearTimeout(timer);
  }
}

// JSON extraction. Ports the archive pattern for the common case where the
// model wraps JSON in prose — grabs the first { ... } island.
export function extractJson<T>(text: string): T | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
