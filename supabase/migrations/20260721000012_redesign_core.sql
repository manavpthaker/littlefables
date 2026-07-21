-- Redesign core (2026-07-20 brief): comprehension ladder + retell, parent
-- settings, per-story shelf visibility, word re-encounter loop, minutes-read
-- sessions, weekly parent insights. All changes additive (PRD D7).

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- books.shelf_enabled — parent per-story on/off toggle for the child's shelf.
-- Orthogonal to lifecycle status: a published book can still be switched off.
-- ---------------------------------------------------------------------------
alter table public.books
  add column shelf_enabled boolean not null default true;

-- ---------------------------------------------------------------------------
-- children.settings — parent-set child settings (reading level ease|auto|stretch,
-- checksEnabled, bedtime window, dailyLimitMin, narratorVoiceId). Band stays its
-- own column (predates settings; FK'd into prompts everywhere). Zod source of
-- truth: lib/models/settings.ts.
-- ---------------------------------------------------------------------------
alter table public.children
  add column settings jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- wordbook_entries — PRD B5 spaced re-encounter loop mechanics.
-- last_encounter_at/encounter_count track re-meetings; owned_at (existing)
-- is set when a due word is re-encountered + understood.
-- ---------------------------------------------------------------------------
alter table public.wordbook_entries
  add column last_encounter_at timestamptz,
  add column encounter_count int not null default 0;

-- ---------------------------------------------------------------------------
-- comprehension_records — add 'retell' to question_type (the ladder's top rung)
-- and a payload jsonb for server-held judge material (expectedConcepts,
-- fallbackChoices, hint/given) and retell beat state ({beats, beatsHit}).
-- The CHECK swap is value-additive: every existing row still passes.
-- TS mirror: RECORD_QUESTION_TYPES in lib/models/checkpoint.ts
-- (tests/models/schema-sync.spec.ts asserts equality against THIS file).
-- ---------------------------------------------------------------------------
alter table public.comprehension_records
  drop constraint comprehension_records_question_type_check;
alter table public.comprehension_records
  add constraint comprehension_records_question_type_check
  check (question_type in ('recall','inference','prediction','connection','retell'));
alter table public.comprehension_records
  add column payload jsonb;

-- ---------------------------------------------------------------------------
-- reading_sessions — minutes-read source of truth for Parent Insights.
-- The client heartbeat sends CUMULATIVE seconds per reader session; the server
-- upserts greatest(existing, incoming) so outbox retries are idempotent.
-- ---------------------------------------------------------------------------
create table public.reading_sessions (
  child_id uuid not null references public.children(id) on delete cascade,
  session_id text not null,
  day date not null,
  seconds int not null default 0 check (seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (child_id, session_id)
);
create index reading_sessions_child_day_idx on public.reading_sessions(child_id, day);
create trigger reading_sessions_touch before update on public.reading_sessions
  for each row execute function public.set_updated_at();

alter table public.reading_sessions enable row level security;
create policy "parent reads own reading sessions" on public.reading_sessions
  for select using (
    child_id in (select id from public.children where household_id = public.current_parent_household_id())
  );

-- ---------------------------------------------------------------------------
-- parent_insights — weekly generated "say this tomorrow" bridge line + story
-- layers summary, cached per (child, week) so the LLM runs once a week.
-- ---------------------------------------------------------------------------
create table public.parent_insights (
  household_id uuid not null references public.households(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  week_start date not null,
  bridge_line text,
  layers jsonb,
  created_at timestamptz not null default now(),
  primary key (child_id, week_start)
);
create index parent_insights_hh_idx on public.parent_insights(household_id);

alter table public.parent_insights enable row level security;
create policy "parent reads own insights" on public.parent_insights
  for select using (household_id = public.current_parent_household_id());
