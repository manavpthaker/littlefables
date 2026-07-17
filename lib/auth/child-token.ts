import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { admin } from '@/lib/supabase/admin';

// Child-device token (PRD D3). Scoped to (child_id, household_id) with a 90-day
// TTL and hash-stored server-side. The raw token is only returned once at mint.
// A stolen token can only read one child's data (audit C3 fix).

export const CHILD_TOKEN_COOKIE = 'lf_child_token';
export const CHILD_TOKEN_TTL_DAYS = 90;

export interface ChildContext {
  childId: string;
  householdId: string;
  deviceId: string;
}

export interface MintedToken {
  raw: string;
  deviceId: string;
  expiresAt: string;
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export async function mintChildToken(params: {
  childId: string;
  householdId: string;
  deviceLabel?: string;
}): Promise<MintedToken> {
  const raw = randomBytes(32).toString('base64url');
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin()
    .from('child_devices')
    .insert({
      child_id: params.childId,
      household_id: params.householdId,
      device_label: params.deviceLabel ?? null,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(`mintChildToken failed: ${error?.message ?? 'unknown'}`);
  return { raw, deviceId: data.id, expiresAt };
}

export async function verifyChildToken(raw: string | undefined): Promise<ChildContext | null> {
  if (!raw) return null;
  const hash = sha256(raw);

  const { data, error } = await admin()
    .from('child_devices')
    .select('id, child_id, household_id, token_hash, expires_at, revoked_at')
    .eq('token_hash', hash)
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;

  // Constant-time recheck to guard against timing side-channels in the DB path.
  const a = Buffer.from(hash);
  const b = Buffer.from(data.token_hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // Fire-and-forget last-seen touch (best-effort; do not block or fail auth on it).
  void admin()
    .from('child_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', data.id);

  return { childId: data.child_id, householdId: data.household_id, deviceId: data.id };
}
