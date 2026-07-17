-- The Phase 0 unique index on wordbook_entries used an expression:
--   create unique index wordbook_entries_child_word_idx on wordbook_entries(child_id, lower(word))
-- Postgres can't target expression indexes via `ON CONFLICT (columns)`, so
-- upsert deduplication was broken. We already lowercase words at the app
-- layer (stemOf → lib/reader/state.ts) — so a plain unique constraint on
-- (child_id, word) is correct + upsert-friendly.

drop index if exists public.wordbook_entries_child_word_idx;

alter table public.wordbook_entries
  add constraint wordbook_entries_child_word_key unique (child_id, word);
