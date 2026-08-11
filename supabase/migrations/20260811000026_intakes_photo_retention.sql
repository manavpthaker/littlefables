-- Intake: photo consent, and a retention clock the buyer controls.
--
-- Why this exists. We collect photographs of children. Until now the row
-- recorded `photo_path` and nothing else: no record that the buyer agreed
-- to anything, no expiry, and no way to delete. Three consequences, all
-- live before this migration:
--
--   1. docs/commerce/market-research.md sells "we delete by default" as a
--      differentiator against KidTeller and SkazkaAI. There was no delete
--      anywhere in the repo — not a script, not a `.remove()` call. We were
--      making a privacy claim the code did not keep.
--   2. The photo reaches third-party models today. scripts/order-preview.ts
--      seeds reference/child-photo.jpg and writes photo-signed-url.txt so
--      the operator can hand it to ChatGPT. Operator-pasted rather than
--      API-posted is a real difference in control, but not one the
--      provider's terms care about. Consent should be recorded because
--      that is true, not because it might become true.
--   3. Nothing expired. A photo uploaded in August would still be sitting
--      in the bucket years later with no one having decided it should.
--
-- The model the household chose: the photo is needed to build the book, so
-- it is kept through delivery. Once the book is in their hands the buyer
-- decides — keep it on file so a second book can reuse the character, or
-- delete it. **Silence means delete.** A buyer who ignores the email gets
-- the privacy-preserving outcome, which is the only reading under which
-- "we delete by default" is an honest sentence.
--
-- Fields:
--   photo_consent_at  When the buyer submitted the form that carried the
--                     photo, i.e. when they saw and accepted the upload
--                     copy. Null for rows predating this migration — those
--                     photos were collected under older copy and should be
--                     purged rather than grandfathered. See the backfill
--                     at the bottom.
--   photo_retention   'pending' until the buyer answers, then 'keep' or
--                     'delete'. Text not enum, matching age_band's
--                     reasoning: the labels may drift and enums are
--                     painful to migrate.
--   photo_choice_at   When they answered. Distinguishes a deliberate
--                     'keep' from a row that has not been asked yet.
--   photo_deleted_at  Set by the purge once the storage object is actually
--                     gone. The row keeps photo_path as a tombstone so we
--                     can tell "never had a photo" from "had one, deleted
--                     it" — which is the difference between a shrug and an
--                     audit trail.
--   delivered_at      The retention clock starts at delivery, and `status`
--                     only tells us the current state, not when it changed.

alter table public.intakes
  add column if not exists photo_consent_at timestamptz,
  add column if not exists photo_retention text not null default 'pending',
  add column if not exists photo_choice_at timestamptz,
  add column if not exists photo_deleted_at timestamptz,
  add column if not exists delivered_at timestamptz;

alter table public.intakes
  drop constraint if exists intakes_photo_retention_check;

alter table public.intakes
  add constraint intakes_photo_retention_check
  check (photo_retention in ('pending', 'keep', 'delete'));

-- The purge's working set: rows that still have a live photo. Partial, so
-- it stays small as deleted rows accumulate.
create index if not exists intakes_photo_pending_idx
  on public.intakes (photo_retention, delivered_at)
  where photo_path is not null and photo_deleted_at is null;

-- Backfill. Rows that already carry a photo were collected under copy that
-- said nothing about retention, so they cannot be treated as consented.
-- Mark them 'delete' rather than 'pending': 'pending' would wait for an
-- answer to a question those buyers were never asked.
update public.intakes
   set photo_retention = 'delete'
 where photo_path is not null
   and photo_deleted_at is null
   and photo_consent_at is null;
