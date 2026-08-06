-- intakes — buyer intake submissions from /intake.
--
-- The Etsy download PDF points buyers at littlefables.app/intake. The form
-- posts here; this table is the fulfillment queue. Every row is a book
-- Manav will build by hand: read the row, run scripts/new-household.ts to
-- provision, author story.json, generate art, publish with content:add.
--
-- No RLS: the API route reads with the service role, and the parent-gated
-- /parent/intakes page also reads server-side with the service role. This
-- is not per-tenant data — it's the shop inbox.
--
-- Fields:
--   status         'new' when submitted, 'in_progress' once Manav starts,
--                  'delivered' once the magic URL has gone out. 'archived'
--                  hides it from the default admin view.
--   buyer_email    Where previews + delivery email land. Required at form
--                  time so we never end up with an unreachable buyer.
--   etsy_order     Optional Etsy order number if the buyer thought to
--                  include it — useful for reconciling with the shop.
--   child_name     As it should appear in the book. Nicknames welcome.
--   age_band       '3–4' | '5–6' | '7–8' | '9+' — the same bands the shop
--                  uses. Kept as text (not an enum) because the form
--                  labels may drift and enums are painful to migrate.
--   interests      Up to 3, from the chip list on the form.
--   traits         Up to 2, ditto.
--   inspirations   Free text — picture books the buyer loves the look of.
--                  This is the anchor for the art-style previews.
--   look           Free text — how the child looks (hair, skin, outfit).
--   photo_path     Storage key inside the intake-uploads bucket, or null.
--                  We store the key, not the URL, so bucket privacy can
--                  change without a data migration.
--   gift_from      Optional buyer display name if this is a gift order.
--   notes          Free text Manav writes on the admin page as the order
--                  moves through the pipeline.
--   household_id   Backfilled once the household is provisioned, so the
--                  admin page can jump straight to the reader URL.

create table public.intakes (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new' check (status in ('new', 'in_progress', 'delivered', 'archived')),
  buyer_email text not null,
  etsy_order text,
  child_name text not null,
  age_band text,
  interests text[] not null default '{}',
  traits text[] not null default '{}',
  inspirations text,
  look text,
  photo_path text,
  gift_from text,
  notes text,
  household_id uuid references public.households(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index intakes_status_created_idx on public.intakes (status, created_at desc);
create index intakes_created_idx on public.intakes (created_at desc);

alter table public.intakes enable row level security;
-- No policies: only the service role reads/writes.

-- Photo uploads: private bucket. Referenced from the admin page via a
-- short-lived signed URL; never linked from the buyer-facing thanks page.
insert into storage.buckets (id, name, public)
values ('intake-uploads', 'intake-uploads', false)
on conflict (id) do nothing;
