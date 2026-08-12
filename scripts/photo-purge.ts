/**
 * Delete buyer photos that should no longer exist.
 *
 * The retention promise on the intake form is: we keep the photo until your
 * book arrives, then you choose — keep it on file for a future book, or delete
 * it — and **if you don't reply, we delete it.** The buyer-facing page at
 * /intake/<token>/photo handles the people who answer. This handles everyone
 * else, which is most of them.
 *
 * Without this script the promise is decoration. docs/commerce/market-research.md
 * has been selling "we delete by default" as a differentiator since before any
 * delete existed anywhere in the repo.
 *
 * Three sets get purged:
 *   1. photo_retention = 'delete' with the file still present. Normally the API
 *      route deletes inline, so a row here means that call failed partway.
 *   2. photo_retention = 'pending' where delivery was more than GRACE_DAYS ago.
 *      This is the "silence means delete" case.
 *   3. The pre-consent backfill — rows whose photos were collected under copy
 *      that promised nothing, marked 'delete' by migration 20260811000026.
 *
 * 'keep' is never touched. That was an explicit choice by the buyer, and it is
 * revocable at any time from the same page.
 *
 *   pnpm photo:purge              # dry run — lists what WOULD be deleted
 *   pnpm photo:purge --apply      # actually delete
 *   pnpm photo:purge --grace 14   # override the 30-day window
 *
 * Dry run is the default deliberately: this deletes buyer data irreversibly,
 * and a script that does that on a bare invocation is one fat finger from an
 * apology email.
 */

import { admin, arg } from './order-lib';

const APPLY = process.argv.includes('--apply');
const GRACE_DAYS = Number(arg('grace') ?? 30);

async function main() {
  if (!Number.isFinite(GRACE_DAYS) || GRACE_DAYS < 0) {
    throw new Error(`--grace must be a non-negative number of days, got "${arg('grace')}"`);
  }

  const supa = admin();
  const cutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await supa
    .from('intakes')
    .select('id, child_name, buyer_email, photo_path, photo_retention, delivered_at, photo_consent_at, photo_choice_at')
    .not('photo_path', 'is', null)
    .is('photo_deleted_at', null);
  if (error) throw new Error(`could not read intakes: ${error.message}`);

  const due = (rows ?? []).filter((r) => {
    if (r.photo_retention === 'keep') return false;

    // An explicit buyer 'delete' is honoured immediately, delivered or not —
    // they asked, and the API route normally does it inline anyway.
    if (r.photo_retention === 'delete' && r.photo_choice_at) return true;

    // Everything else waits for delivery plus the grace window. That covers
    // 'pending' (nobody replied) AND the pre-consent rows migration 26
    // backfilled to 'delete' — those carry no photo_choice_at, and sweeping
    // them on flag alone would delete the reference photo of an order still
    // being built. The backfill means "do not keep this", not "destroy it
    // mid-fulfilment".
    return !!r.delivered_at && r.delivered_at < cutoff;
  });

  console.log(
    `\n${rows?.length ?? 0} row(s) with a live photo · ${due.length} due for deletion` +
      ` (grace ${GRACE_DAYS}d, cutoff ${cutoff.slice(0, 10)})`,
  );

  if (due.length === 0) {
    console.log('Nothing to do.\n');
    return;
  }

  for (const r of due) {
    const why = r.photo_choice_at
      ? 'buyer chose delete'
      : r.photo_consent_at
        ? `no reply ${GRACE_DAYS}d after delivery`
        : `collected before consent copy existed, delivered >${GRACE_DAYS}d ago`;
    console.log(`  ${APPLY ? '✂' : '·'} ${r.child_name} <${r.buyer_email}> — ${why}`);
  }

  if (!APPLY) {
    console.log(`\nDry run. Re-run with --apply to delete these ${due.length} photo(s).\n`);
    return;
  }

  let ok = 0;
  for (const r of due) {
    if (!r.photo_path) continue;
    const { error: rmErr } = await supa.storage.from('intake-uploads').remove([r.photo_path]);
    if (rmErr) {
      // Keep going: one bad key must not strand every later row's deletion.
      console.warn(`  ! ${r.child_name}: storage remove failed — ${rmErr.message}`);
      continue;
    }
    const now = new Date().toISOString();
    const { error: updErr } = await supa
      .from('intakes')
      .update({ photo_deleted_at: now, photo_retention: 'delete', updated_at: now })
      .eq('id', r.id);
    if (updErr) {
      console.warn(`  ! ${r.child_name}: file deleted but row not stamped — ${updErr.message}`);
      continue;
    }
    ok += 1;
  }

  console.log(`\nDeleted ${ok}/${due.length}.\n`);
}

main().catch((err) => {
  console.error(`\nphoto:purge failed — ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
