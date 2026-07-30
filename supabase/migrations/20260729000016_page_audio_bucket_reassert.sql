-- The page-audio bucket was originally created by migration
-- 20260717000008_page_audio_bucket.sql, but it went missing on the hosted
-- project during the pare-back cleanup. Re-assert it here so `content:narrate`
-- has somewhere to upload MP3s + timestamps.json. Idempotent — no-op if the
-- bucket already exists.

insert into storage.buckets (id, name, public)
values ('page-audio', 'page-audio', true)
on conflict (id) do nothing;
