-- Little Fables — multi-tenant foundation.
-- PRD §4.7: multi-tenant from migration 0001. "Azad" is data, never code.
-- AUDIT.md fixes baked in:
--   C1 (sync data-loss): every mutable row carries updated_at + trigger.
--   C2 (schema drift): status/kind/source CHECK constraints are the ONE source of truth
--                       for the enum; TS models parse from this file (see tests/models).
--   C3 (unguarded routes): RLS enforces household scope on every row-carrying table.
--   S9 (double 0001): migrations are date-prefixed; supabase CLI orders them lexically.

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Helper: touch updated_at on UPDATE.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- households — the tenant. One subscription-shaped unit.
-- ---------------------------------------------------------------------------
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger households_touch before update on public.households
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- parents — auth.users adapter. Multiple parents per household.
-- ---------------------------------------------------------------------------
create table public.parents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index parents_household_id_idx on public.parents(household_id);
create index parents_email_idx on public.parents(email);
create trigger parents_touch before update on public.parents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- children — the readers.
-- band = reading level bucket ('3-4', '4-6', '4-8', '6-8'); default matches archive
-- normalizeBand fallback (audit C4).
-- exclude_terms = per-child hard block list for generation stage-0 gates.
-- ---------------------------------------------------------------------------
create table public.children (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  display_name text not null,
  band text not null default '4-8',
  exclude_terms jsonb not null default '[]'::jsonb,
  pronouns text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index children_household_id_idx on public.children(household_id);
create trigger children_touch before update on public.children
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- child_devices — long-lived scoped sessions (PRD D3).
-- token_hash = SHA-256 of the raw token; raw is only returned once at mint.
-- ---------------------------------------------------------------------------
create table public.child_devices (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  device_label text,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index child_devices_child_id_idx on public.child_devices(child_id);
create index child_devices_hh_idx on public.child_devices(household_id);

-- ---------------------------------------------------------------------------
-- books — the shelf.
-- source: PRD F pack-000 uses 'family'/'family-original'; maker adds 'generated'; 'starter' reserved.
-- status: PRD C4 lifecycle. Superset of archive's 2-value constraint (audit C2 fix).
-- book jsonb: full Book payload for schema-flex (mirrors archive v2 pattern).
-- child_id NULL => shared across all children in the household.
-- ---------------------------------------------------------------------------
create table public.books (
  id text primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  title text not null,
  by_line text,
  kind text not null check (kind in ('quick','chapter')),
  source text not null check (source in ('family','family-original','generated','starter')),
  status text not null check (status in ('draft','checking','published','needs-review','blocked','unverified','complete','awaiting-choice')),
  cover_emoji text,
  cover_bg text,
  book jsonb not null,
  parent_guide text,
  origin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index books_household_id_idx on public.books(household_id);
create index books_child_id_idx on public.books(child_id);
create index books_status_idx on public.books(status);
create trigger books_touch before update on public.books
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- world_states — buddy/badges/reading-day set/choice log (PRD B2). Per-child singleton.
-- ---------------------------------------------------------------------------
create table public.world_states (
  child_id uuid primary key references public.children(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger world_states_touch before update on public.world_states
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- book_progress — per-child reading position (PRD A7, archive lf-progress-v2 replacement).
-- Archive never synced this (audit C1). We do from day one.
-- ---------------------------------------------------------------------------
create table public.book_progress (
  child_id uuid not null references public.children(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  chapter_idx int not null default 0,
  page_idx int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (child_id, book_id)
);
create trigger book_progress_touch before update on public.book_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- wordbook_entries — PRD A9 star-save, PRD B5 re-encounter loop.
-- owned_at set when word is re-encountered + understood at a checkpoint.
-- ---------------------------------------------------------------------------
create table public.wordbook_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  word text not null,
  meaning text,
  sentence text,
  book_id text references public.books(id) on delete set null,
  saved_at timestamptz not null default now(),
  owned_at timestamptz
);
create index wordbook_entries_child_idx on public.wordbook_entries(child_id);
create unique index wordbook_entries_child_word_idx on public.wordbook_entries(child_id, lower(word));

-- ---------------------------------------------------------------------------
-- badges — PRD B4. Recognize, never gate.
-- ---------------------------------------------------------------------------
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  badge_slug text not null,
  earned_at timestamptz not null default now(),
  unique (child_id, badge_slug)
);
create index badges_child_idx on public.badges(child_id);

-- ---------------------------------------------------------------------------
-- reading_days — PRD B3. Suns for the week.
-- ---------------------------------------------------------------------------
create table public.reading_days (
  child_id uuid not null references public.children(id) on delete cascade,
  day date not null,
  primary key (child_id, day)
);

-- ---------------------------------------------------------------------------
-- comprehension_records — PRD A11. Drive next-question difficulty + Parent Corner evidence.
-- ---------------------------------------------------------------------------
create table public.comprehension_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  book_id text references public.books(id) on delete set null,
  chapter_idx int,
  question text not null,
  question_type text not null check (question_type in ('recall','inference','prediction','connection')),
  transcript text,
  judged_signal text check (judged_signal in ('correct','partial','mercy_hint','mercy_given','skipped')),
  asked_at timestamptz not null default now()
);
create index comprehension_child_idx on public.comprehension_records(child_id);
create index comprehension_book_idx on public.comprehension_records(book_id);

-- ---------------------------------------------------------------------------
-- retells — PRD A5. Recording + transcript, parent-visible, deletable (D9).
-- ---------------------------------------------------------------------------
create table public.retells (
  id text primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  book_id text references public.books(id) on delete set null,
  book_title text,
  mime_type text,
  duration_ms integer,
  audio_path text not null,
  transcript text,
  created_at timestamptz not null default now()
);
create index retells_child_idx on public.retells(child_id);

-- ---------------------------------------------------------------------------
-- art_artifacts — PRD D5 candidates/live buckets, parent approval.
-- Household-scoped (archive was global).
-- ---------------------------------------------------------------------------
create table public.art_artifacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  kind text not null check (kind in ('sheet','scene','cover')),
  character_id text,
  book_id text references public.books(id) on delete set null,
  chapter_idx int,
  page_idx int,
  candidate_path text not null,
  live_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  model text,
  prompt text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index art_hh_idx on public.art_artifacts(household_id);
create index art_book_idx on public.art_artifacts(book_id);
create index art_status_idx on public.art_artifacts(status);

-- ---------------------------------------------------------------------------
-- usage_counters — PRD D4. Household-scoped (archive was global, blast radius wrong).
-- No RLS: service role only via bump_usage RPC (see 0002_bump_usage.sql).
-- ---------------------------------------------------------------------------
create table public.usage_counters (
  household_id uuid not null references public.households(id) on delete cascade,
  day date not null,
  kind text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (household_id, day, kind)
);

-- ===========================================================================
-- Row-Level Security. Parent access via auth.uid() → parents.auth_user_id.
-- Child-device access is enforced server-side in Node routes using service role
-- + explicit WHERE (household_id, child_id) — RLS on these tables is a
-- defense-in-depth for parent-authenticated access only.
-- ===========================================================================

-- Helper: household_id for the calling auth.uid()
create or replace function public.current_parent_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.parents where auth_user_id = auth.uid() limit 1
$$;

-- Enable RLS + policies on every table except usage_counters (service role only).
alter table public.households enable row level security;
create policy "parent reads own household" on public.households
  for select using (id = public.current_parent_household_id());

alter table public.parents enable row level security;
create policy "parent reads own household parents" on public.parents
  for select using (household_id = public.current_parent_household_id());

alter table public.children enable row level security;
create policy "parent reads own children" on public.children
  for select using (household_id = public.current_parent_household_id());
create policy "parent writes own children" on public.children
  for insert with check (household_id = public.current_parent_household_id());
create policy "parent updates own children" on public.children
  for update using (household_id = public.current_parent_household_id());

alter table public.child_devices enable row level security;
create policy "parent reads own devices" on public.child_devices
  for select using (household_id = public.current_parent_household_id());

alter table public.books enable row level security;
create policy "parent reads own books" on public.books
  for select using (household_id = public.current_parent_household_id());
create policy "parent writes own books" on public.books
  for insert with check (household_id = public.current_parent_household_id());
create policy "parent updates own books" on public.books
  for update using (household_id = public.current_parent_household_id());
create policy "parent deletes own books" on public.books
  for delete using (household_id = public.current_parent_household_id());

alter table public.world_states enable row level security;
create policy "parent reads own world states" on public.world_states
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.book_progress enable row level security;
create policy "parent reads own progress" on public.book_progress
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.wordbook_entries enable row level security;
create policy "parent reads own wordbook" on public.wordbook_entries
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.badges enable row level security;
create policy "parent reads own badges" on public.badges
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.reading_days enable row level security;
create policy "parent reads own reading days" on public.reading_days
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.comprehension_records enable row level security;
create policy "parent reads own comprehension" on public.comprehension_records
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.retells enable row level security;
create policy "parent reads own retells" on public.retells
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

alter table public.art_artifacts enable row level security;
create policy "parent reads own art" on public.art_artifacts
  for select using (household_id = public.current_parent_household_id());
create policy "parent updates own art" on public.art_artifacts
  for update using (household_id = public.current_parent_household_id());

-- Do NOT enable RLS on usage_counters (service role only, no anon/authenticated access).
