#!/usr/bin/env tsx
// Kick off a new Etsy order.
//
// Every custom-book sale on Etsy goes through this. It creates an
// awaiting intake row keyed to the buyer's email + order number, mints
// a token, and prints the personal intake URL you'll paste into Etsy's
// "message to buyer" box (Etsy already has their attention there).
//
// Usage:
//   pnpm exec tsx scripts/new-order.ts \
//     --etsy 3852749102 \
//     --email kate@example.com \
//     --name "Kate Smith"
//
// Optional:
//   --child "Emma"      # if Etsy personalization captured a name
//   --gift-from "Kate"  # if the listing is a gift order
//   --send-email        # also send the welcome email via Resend
//                       # (default off — use for friend/direct orders;
//                       # for Etsy, paste into Etsy Messages instead)
//   --base-url https://littlefables.app
//
// Output:
//   Intake id: <uuid>
//   Magic URL: https://littlefables.app/intake/<token>
//
// The magic URL is stable for that order. Re-running with the same --etsy
// value returns the existing row's URL instead of creating a duplicate.

import { randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { sendWelcomeEmail } from '../lib/server/resend-mailer';

config({ path: '.env.local' });

function arg(name: string): string | undefined {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

function required(name: string): string {
  const v = arg(name);
  if (!v) {
    console.error(`Missing --${name}`);
    process.exit(1);
  }
  return v;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

/** URL-safe token, 128 bits of entropy. Base64url without padding, no
 *  ambiguous characters after normalization. Long enough that guessing
 *  is out of the question; short enough to paste into an Etsy message. */
function mintToken(): string {
  return randomBytes(16)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function main(): Promise<void> {
  const etsyOrder = required('etsy');
  const buyerEmail = required('email').toLowerCase();
  const buyerName = required('name');
  const childName = arg('child') ?? '';
  const giftFrom = arg('gift-from') ?? null;
  const shouldSendEmail = hasFlag('send-email');
  const baseUrl = (arg('base-url') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'https://littlefables.app').replace(/\/$/, '');

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    console.error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local');
    process.exit(1);
  }
  const supa = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Reuse existing row for this Etsy order so re-running the script is safe.
  const existing = await supa
    .from('intakes')
    .select('id, token, status')
    .eq('etsy_order', etsyOrder)
    .maybeSingle();

  if (existing.error) {
    console.error('Lookup failed:', existing.error.message);
    process.exit(1);
  }

  if (existing.data?.token) {
    console.log('Existing order — reusing:');
    console.log(`  Intake id: ${existing.data.id}`);
    console.log(`  Status:    ${existing.data.status}`);
    console.log(`  Magic URL: ${baseUrl}/intake/${existing.data.token}`);
    return;
  }

  const token = mintToken();

  const insert = await supa
    .from('intakes')
    .insert({
      status: 'awaiting',
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      etsy_order: etsyOrder,
      child_name: childName,
      gift_from: giftFrom,
      token,
    })
    .select('id')
    .single();

  if (insert.error || !insert.data) {
    console.error('Insert failed:', insert.error?.message ?? 'unknown error');
    process.exit(1);
  }

  const intakeUrl = `${baseUrl}/intake/${token}`;

  console.log('New order created.');
  console.log(`  Intake id: ${insert.data.id}`);
  console.log(`  Buyer:     ${buyerName} <${buyerEmail}>`);
  console.log(`  Etsy #:    ${etsyOrder}`);
  console.log('');
  console.log(`  Magic URL: ${intakeUrl}`);
  console.log('');

  if (shouldSendEmail) {
    try {
      const messageId = await sendWelcomeEmail({
        to: buyerEmail,
        buyerName,
        intakeUrl,
      });
      console.log(`Welcome email sent (Resend id: ${messageId}).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Welcome email failed: ${msg}`);
      console.error('Row is still saved; paste the magic URL into Etsy Messages as a fallback.');
    }
  } else {
    console.log('Paste the magic URL into the Etsy "message to buyer" box.');
    console.log('(Or add --send-email to email the buyer directly.)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
