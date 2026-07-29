-- book-art bucket: covers + per-page illustrations for locally-authored
-- books. Uploaded via `pnpm content:add <folder>` from the terminal.
-- Public read (rendered by the reader with a plain <img> URL); only the
-- service role writes.

insert into storage.buckets (id, name, public)
values ('book-art', 'book-art', true)
on conflict (id) do nothing;

-- The old art-candidates / art-live / retells buckets were tied to the
-- deleted generation + retell features. Their contents are orphan objects
-- now — remove the buckets so they don't confuse future readers of the
-- storage dashboard. Buckets must be empty to drop; delete objects first.
delete from storage.objects where bucket_id in ('art-candidates', 'art-live', 'retells');
delete from storage.buckets where id in ('art-candidates', 'art-live', 'retells');
