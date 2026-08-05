-- gift_codes — one-time redemption codes for gift orders.
--
-- Grandma buys, does the intake, gets every trust-building email, approves the
-- art — then hands the certificate to the parents, who have had zero contact
-- with us. Playbook step 28 originally reused the buyer's magic URL for the
-- certificate; that meant no revocation and the raw token was permanently
-- the book. Gift codes replace that: the recipient parent gets their own
-- redemption code, which mints a fresh child_devices row for their browser.
-- See docs/commerce/delivery-flow.md.
--
-- Fields:
--   code                Human-readable 8-char code (Crockford base32 alphabet,
--                       no confusing 0/O/1/I/L). Printed on the paper cert
--                       and encoded in the QR. Case-insensitive on lookup.
--   household_id        The household this gift grants access to.
--   child_id            Which kid's shelf specifically (a household usually
--                       has one, but the FK is here so the redemption screen
--                       can show the right name and cover).
--   book_slug           The story-title slug used to construct the reader
--                       URL after redemption (/read/<slug>/<token>).
--   gift_from           Buyer name for display on the redemption screen —
--                       "A gift from Grandma June". Comes off the intake.
--   expires_at          Optional; nulls mean no expiry. Recommend ~90d.
--   revoked_at          Soft-delete on reissue — old code stops working.
--   redeemed_at         Marks single-use. Set at first successful redeem.
--   redeemed_device_id  The child_devices row minted at redemption. Kept
--                       for the "delivery signal" email — "Grandma, your
--                       gift was opened at 2:14pm."

create table public.gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  household_id uuid not null references public.households(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  book_slug text not null,
  gift_from text,
  expires_at timestamptz,
  revoked_at timestamptz,
  redeemed_at timestamptz,
  redeemed_device_id uuid references public.child_devices(id) on delete set null,
  created_at timestamptz not null default now()
);

create index gift_codes_household_idx on public.gift_codes(household_id);
create index gift_codes_child_idx on public.gift_codes(child_id);

alter table public.gift_codes enable row level security;
-- No RLS policies: /api/gift/<code>/redeem uses the service role with
-- code-scoping enforced in-code. Same posture as book_shares.

comment on table public.gift_codes is
  'One-time redemption codes for gift orders. Recipient parent opens /gift/<code>, one screen of orientation, then mints their own child_devices token. Revocation-friendly (reissue by minting a new row and revoking the old).';
