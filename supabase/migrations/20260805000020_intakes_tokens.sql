-- Per-order intake tokens.
--
-- Original intakes model assumed the buyer walks up to /intake cold and
-- self-identifies by typing their email. Cleaner model: Manav pre-creates
-- an intake row from the Etsy order (email + buyer name known already),
-- mints a token, and sends the buyer a personal link. The buyer never
-- retypes their email; the row goes from 'awaiting' → 'new' on submit.
--
-- Fields:
--   token         Random URL-safe id (base32/base64url), long enough to
--                 be unguessable. Nullable because pre-token rows and
--                 walk-up submissions still work.
--   buyer_name    From Etsy, so admin listing reads well without the
--                 buyer having to retype it.
--   awaiting      New status value for rows created by scripts/new-order.ts
--                 before the buyer opens the link.

alter table public.intakes
  add column if not exists token text unique,
  add column if not exists buyer_name text;

alter table public.intakes
  drop constraint if exists intakes_status_check;

alter table public.intakes
  add constraint intakes_status_check
  check (status in ('awaiting', 'new', 'in_progress', 'delivered', 'archived'));

create index if not exists intakes_token_idx on public.intakes (token);
