-- Pare-back (2026-07-29): the app is now a curated storytelling reader.
-- Removes every table and RPC that supported generation, comprehension,
-- word saving, art approval, and telemetry. What remains is just the
-- storytelling core: households / parents / children / child_devices /
-- books / book_progress.
--
-- Storage buckets art-candidates and art-final are dropped separately via
-- the Supabase dashboard; migrations don't manage bucket lifecycle.

-- Money-tracking + budget RPC — no LLMs left, nothing to bump.
drop function if exists public.bump_usage(uuid, text);
drop table if exists public.api_usage cascade;

-- Comprehension: chapter-end checkpoints + retell + adaptivity records.
drop table if exists public.comprehension_records cascade;

-- Wordbook: kid-side word saving is gone; tap-to-hear is the whole word
-- interaction now.
drop table if exists public.wordbook_entries cascade;

-- Art pipeline: candidates + approvals no longer relevant (books are
-- illustrated locally and uploaded via the terminal).
drop table if exists public.art_artifacts cascade;

-- Story QA pipeline: nothing generates stories to QA.
drop table if exists public.qa_records cascade;

-- Telemetry: no analytics use case for a single-family curated reader.
drop table if exists public.usage_events cascade;

-- World state: badges / greetings / streaks / word-scheduler have all been
-- deleted from the app. The row was a jsonb blob of derived state; nothing
-- reads it any more.
drop table if exists public.world_states cascade;

-- Parent insights (weekly bridge line cache). Insights surface is gone.
drop table if exists public.parent_insights cascade;

-- Minutes-per-day tracking supported the daily limit + parent insights;
-- both are gone with the pare-back.
drop table if exists public.reading_sessions cascade;
drop table if exists public.reading_days cascade;

-- Book-level fields that only mattered to the deleted features:
--   layer_tag  — shelf grouping / cover chip (removed)
--   parent_guide — per-book parent-facing note (surface removed)
--   shelf_enabled retained: parent still needs to hide books.
alter table public.books drop column if exists layer_tag;
alter table public.books drop column if exists parent_guide;
