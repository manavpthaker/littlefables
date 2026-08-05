import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';

// Gift code model. See supabase/migrations/20260805000018_gift_codes.sql
// for schema and docs/commerce/delivery-flow.md for the flow.
//
// Codes are 8 characters from Crockford's base32 (no 0/O/1/I/L). Printed
// on the paper certificate as `XXXX-XXXX` for readability; the dash is
// stripped on lookup, and comparison is case-insensitive. Stored uppercase.

// Crockford base32 — https://www.crockford.com/base32.html
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Generate a fresh 8-char code. ~40 bits of entropy — 10^12 possible
 *  codes, and we're not going to mint anywhere near that. */
export function generateGiftCode(): string {
  const bytes = randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i]! % 32];
  }
  return out;
}

/** Normalize user-typed / URL-encoded codes for lookup. Strips whitespace
 *  and hyphens; uppercases; only the base32 alphabet survives. */
export function normalizeGiftCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, 8);
}

/** Formatted-for-humans form. What appears on the certificate. */
export function formatGiftCode(code: string): string {
  const c = normalizeGiftCode(code);
  return `${c.slice(0, 4)}-${c.slice(4, 8)}`;
}

export const giftCodeRowSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  household_id: z.string().uuid(),
  child_id: z.string().uuid(),
  book_slug: z.string(),
  gift_from: z.string().nullable(),
  expires_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
  redeemed_at: z.string().nullable(),
  redeemed_device_id: z.string().uuid().nullable(),
  created_at: z.string(),
});
export type GiftCodeRow = z.infer<typeof giftCodeRowSchema>;

export interface RedeemableGift {
  row: GiftCodeRow;
  childName: string;
  bookTitle: string | null;
  bookCoverBg: string | null;
}

/** Look up a code and return the display info needed by the /gift screen.
 *  Returns null if the code doesn't exist, is expired, revoked, or already
 *  redeemed — the RSC treats all four cases as "gift not available." */
export async function findRedeemableGift(rawCode: string): Promise<RedeemableGift | null> {
  const code = normalizeGiftCode(rawCode);
  if (code.length !== 8) return null;

  // Cast until types/database.ts is regenerated with the new table.
  const { data } = await admin().from('gift_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  const row = data as GiftCodeRow | null;
  if (!row) return null;
  if (row.revoked_at) return null;
  if (row.redeemed_at) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return null;

  const [{ data: kid }, { data: book }] = await Promise.all([
    admin()
      .from('children')
      .select('display_name')
      .eq('id', row.child_id)
      .maybeSingle(),
    admin()
      .from('books')
      .select('title, cover_bg')
      .eq('household_id', row.household_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!kid?.display_name) return null;

  return {
    row,
    childName: kid.display_name,
    bookTitle: book?.title ?? null,
    bookCoverBg: book?.cover_bg ?? null,
  };
}

/** Mark a code redeemed by a specific device. Idempotent-ish — refuses
 *  to double-redeem (the SET is guarded by `redeemed_at IS NULL`), so a
 *  race between two tabs of the same recipient still ends with one
 *  device row bound to the code. */
export async function markGiftRedeemed(codeId: string, deviceId: string): Promise<boolean> {
  const { data } = await admin().from('gift_codes')
    .update({ redeemed_at: new Date().toISOString(), redeemed_device_id: deviceId })
    .eq('id', codeId)
    .is('redeemed_at', null)
    .select('id')
    .maybeSingle();
  return Boolean(data);
}

/** Insert a fresh code. Used by scripts/new-household.ts for gift orders. */
export async function insertGiftCode(params: {
  householdId: string;
  childId: string;
  bookSlug: string;
  giftFrom: string | null;
  expiresAt?: string | null;
}): Promise<{ id: string; code: string }> {
  const code = generateGiftCode();
  const { data, error } = await admin().from('gift_codes')
    .insert({
      code,
      household_id: params.householdId,
      child_id: params.childId,
      book_slug: params.bookSlug,
      gift_from: params.giftFrom,
      expires_at: params.expiresAt ?? null,
    })
    .select('id, code')
    .single();
  if (error || !data) throw new Error(`gift_codes insert: ${error?.message ?? 'unknown'}`);
  return data as { id: string; code: string };
}
