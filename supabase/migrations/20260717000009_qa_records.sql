-- QA records for the story maker (PRD C3/C3a).
-- Server-persisted (audit S2 fix — never fire-and-forget). One row per
-- (book_id, attempt), so the full history of what the model tried is auditable.

create table public.qa_records (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references public.books(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  attempt smallint not null default 1,
  status text not null check (status in ('passed', 'needs-review', 'blocked', 'unverified')),
  stage0 jsonb not null default '{}'::jsonb,
  hard_gates jsonb,
  soft_score jsonb,
  canon_version text,
  model text,
  created_at timestamptz not null default now(),
  unique (book_id, attempt)
);
create index qa_records_book_idx on public.qa_records(book_id);
create index qa_records_hh_idx on public.qa_records(household_id);

alter table public.qa_records enable row level security;

-- Parent Corner is unauthenticated in single-user mode; parents read via
-- service role. No policies means no anon/authenticated access.
