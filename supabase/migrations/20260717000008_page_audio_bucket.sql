-- page-audio bucket: pre-generated ElevenLabs narration + word timestamps.
-- Public read (kid device reads directly via CDN URL), writes via service role
-- only. Content is derived from published book text — no user PII.

insert into storage.buckets (id, name, public)
values ('page-audio', 'page-audio', true)
on conflict (id) do nothing;

-- Path convention: <book_id>/<chapter_idx>-<page_idx>.<mp3|timestamps.json>
