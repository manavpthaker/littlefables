-- Fix seed UUIDs: the initial 0003 seed used hand-picked IDs (00…0100) that
-- are not valid v4 UUIDs — the version nibble was 0 instead of [1-8], which
-- Zod v4's .uuid() correctly rejects at the mint endpoint.
--
-- One-shot cleanup: delete the old seed rows and their cascaded children.
-- The new 0003 seed inserts fresh rows with real v4 UUIDs on the next apply.
-- Local dev is unaffected (db reset re-runs both migrations in order).
-- Hosted: pack-000 must be re-imported after this runs (new household_id).

delete from public.books where household_id = '00000000-0000-0000-0000-000000000001'::uuid;
delete from public.child_devices where household_id = '00000000-0000-0000-0000-000000000001'::uuid;
delete from public.children where household_id = '00000000-0000-0000-0000-000000000001'::uuid;
delete from public.parents where household_id = '00000000-0000-0000-0000-000000000001'::uuid;
delete from public.households where id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Now (re-)insert with correct UUIDs. Same values as the updated 0003 —
-- idempotent because 0003 uses `on conflict do nothing`.
insert into public.households (id, name)
values ('4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid, 'Thaker Family')
on conflict (id) do nothing;

insert into public.parents (id, household_id, email, display_name)
values (
  '27252e6f-1957-44bd-abf0-e5dc5d5c31c6'::uuid,
  '4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid,
  'manavpthaker@gmail.com',
  'Papa'
) on conflict (id) do nothing;

insert into public.children (id, household_id, display_name, band, exclude_terms)
values (
  'e27b2fa0-d16f-4c38-9d97-ed05374167de'::uuid,
  '4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid,
  'Azad',
  '4-8',
  '[]'::jsonb
) on conflict (id) do nothing;
