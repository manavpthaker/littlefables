-- book_shares — public share tokens for individual books.
--
-- Each share is a token that grants /share/[token] access to ONE book,
-- regardless of household auth. A book being on Ozzie's shelf and being
-- sharable are orthogonal: the shelf is household-scoped auth; a share
-- is a token grant to one specific book row.
--
-- Fields:
--   token_hash    sha256 of the token; only the hash is stored server-side.
--                 The raw token is returned once at mint time and lives
--                 only in the URL the parent copies.
--   password_hash optional sha256 of a per-share password. When set, the
--                 share page prompts for the password before rendering.
--   expires_at    optional; nulls mean no expiry.
--   revoked_at    soft-delete via revocation. Reader checks both fields.
--   view_count    cheap analytics — how many times the share was opened.

create table public.book_shares (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references public.books(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  token_hash text not null unique,
  password_hash text,
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.parents(id) on delete set null
);

create index book_shares_book_idx on public.book_shares(book_id);
create index book_shares_household_idx on public.book_shares(household_id);

alter table public.book_shares enable row level security;
-- No RLS policies: /api/parent/share and /api/share both go through the
-- service role (admin()) with household scoping enforced in-code.

comment on table public.book_shares is
  'Public share tokens for individual books. Token grants view access to one book only, bypassing household auth.';
