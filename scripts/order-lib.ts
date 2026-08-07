/**
 * Shared helpers for the order:* fulfillment CLIs (preview, full-book,
 * publish). Keeps intake loading, slug derivation, and folder discovery
 * in one place so each CLI can stay short.
 */

import { existsSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { config } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

config({ path: '.env.local' });

export type Intake = Database['public']['Tables']['intakes']['Row'];

export function admin(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');
  return createClient<Database>(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function arg(name: string, argv: string[] = process.argv): string | undefined {
  const flag = `--${name}`;
  const i = argv.indexOf(flag);
  return i >= 0 && i < argv.length - 1 ? argv[i + 1] : undefined;
}

export function positional(argv: string[] = process.argv, index = 0): string | undefined {
  const rest = argv.slice(2).filter((a) => !a.startsWith('--'));
  return rest[index];
}

/** Kebab-case a string for use in a folder or slug. Empty input returns null. */
export function kebab(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || null;
}

/** Derive the household folder slug from intake state. Preference:
 *  1. --household-slug arg (operator override)
 *  2. parent_lastname (once the intake asks for it)
 *  3. `<child>-<order>` fallback so a nameless-buyer order still has a home
 *  4. `<child>` as a last resort
 */
export function householdSlugFromIntake(intake: Intake, override?: string): string {
  if (override) return override;
  const fromLast = kebab(intake.parent_lastname);
  if (fromLast) return fromLast;
  const child = kebab(intake.child_name) ?? 'household';
  const order = kebab(intake.etsy_order ?? intake.id.slice(0, 6));
  return order ? `${child}-${order}` : child;
}

export function workingFolder(intake: Intake): string {
  const order = kebab(intake.etsy_order ?? intake.id.slice(0, 6)) ?? intake.id.slice(0, 6);
  const child = kebab(intake.child_name) ?? 'child';
  return join(homedir(), 'fables-orders', `fables-${order}-${child}`);
}

export function householdFolder(slug: string): string {
  return resolve('content/households', slug);
}

export function bookFolder(householdSlug: string, bookSlug: string): string {
  return join(householdFolder(householdSlug), 'books', bookSlug);
}

/** Find every book folder under a household, preferring one that matches
 *  --book <slug>. Throws if the household folder doesn't exist. */
export function findBookFolder(householdSlug: string, preferSlug?: string): string {
  const booksDir = join(householdFolder(householdSlug), 'books');
  if (!existsSync(booksDir)) {
    throw new Error(`no books directory at ${booksDir} — run order:preview first`);
  }
  const entries = readdirSync(booksDir).filter((slug) => existsSync(join(booksDir, slug, 'story.json')));
  if (entries.length === 0) {
    throw new Error(`no books with story.json under ${booksDir}`);
  }
  if (preferSlug) {
    if (!entries.includes(preferSlug)) {
      throw new Error(`--book ${preferSlug} not found; available: ${entries.join(', ')}`);
    }
    return join(booksDir, preferSlug);
  }
  if (entries.length > 1) {
    throw new Error(`multiple books found — pass --book <slug>; available: ${entries.join(', ')}`);
  }
  return join(booksDir, entries[0]!);
}

export async function fetchIntake(id: string): Promise<Intake> {
  const supa = admin();
  const { data, error } = await supa.from('intakes').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`intake fetch: ${error.message}`);
  if (!data) throw new Error(`no intake row with id ${id}`);
  return data;
}

/** A signed download URL for a private intake-uploads photo. 24h lifetime is
 *  more than enough for a fulfillment session. */
export async function signIntakePhoto(path: string): Promise<string> {
  const supa = admin();
  const { data, error } = await supa.storage.from('intake-uploads').createSignedUrl(path, 60 * 60 * 24);
  if (error || !data) throw new Error(`sign photo: ${error?.message ?? 'no url'}`);
  return data.signedUrl;
}

/** Age band from intake.age_years if present, else fall back to age_band. */
export function ageBand(intake: Intake): '3-4' | '4-6' | '4-8' | '6-8' {
  const raw = intake.age_band ?? '';
  if (raw === '3-4' || raw === '4-6' || raw === '4-8' || raw === '6-8') return raw;
  const y = intake.age_years != null ? Number(intake.age_years) : NaN;
  if (Number.isFinite(y)) {
    if (y < 5) return '3-4';
    if (y < 7) return '4-6';
    if (y < 9) return '4-8';
    return '6-8';
  }
  return '4-8';
}

export function label(intake: Intake): string {
  const child = intake.child_name ?? 'unknown child';
  const order = intake.etsy_order ?? intake.id.slice(0, 8);
  return `${child} (${order})`;
}

export function nowIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export { basename };
