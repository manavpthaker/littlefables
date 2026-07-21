import { admin } from '@/lib/supabase/admin';
import { parseChildSettings, type ChildSettings } from '@/lib/models/settings';
import { CHILD_BANDS, type ChildBand } from '@/lib/models/child';

// One loader for everything a route needs to know about a child's reading
// configuration: the band column (legacy, prompt-critical) + the settings
// jsonb (redesign). Settings parse fail-soft to defaults — a malformed blob
// must never break a child-facing route.

export interface ChildProfile {
  childId: string;
  band: ChildBand;
  /** Per-child hard block list (audit C4): terms the safety pipeline MUST NOT
   *  produce — passed explicitly into every generative call (story, art, QA)
   *  so the guardrail can never be lazy-imported away from a server context. */
  excludeTerms: string[];
  settings: ChildSettings;
}

function normalizeBand(raw: string | undefined | null): ChildBand {
  return (CHILD_BANDS as readonly string[]).includes(raw ?? '') ? (raw as ChildBand) : '4-8';
}

export async function loadChildProfile(childId: string): Promise<ChildProfile> {
  const { data } = await admin()
    .from('children')
    .select('id, band, settings, exclude_terms')
    .eq('id', childId)
    .maybeSingle();

  const excludeTerms = Array.isArray(data?.exclude_terms)
    ? (data.exclude_terms as unknown[]).filter((t): t is string => typeof t === 'string')
    : [];

  return {
    childId,
    band: normalizeBand(data?.band),
    excludeTerms,
    settings: parseChildSettings(data?.settings),
  };
}
