-- book-art bucket: covers + per-page illustrations for locally-authored
-- books. Uploaded via `pnpm content:add <folder>` from the terminal.
-- Public read (rendered by the reader with a plain <img> URL); only the
-- service role writes.
--
-- The old art-candidates / art-live / retells buckets are now orphan — the
-- generation + retell features that filled them are gone. Storage APIs
-- block direct DELETEs from storage.objects, so we don't clean them up in
-- SQL; they're inert and harmless. To remove them for real, do it via the
-- Supabase dashboard (Storage → bucket → delete) or the CLI:
--   supabase storage rm -r ss:///art-candidates
--   supabase storage rm -r ss:///art-live
--   supabase storage rm -r ss:///retells
-- (then delete the buckets from the dashboard).

insert into storage.buckets (id, name, public)
values ('book-art', 'book-art', true)
on conflict (id) do nothing;
