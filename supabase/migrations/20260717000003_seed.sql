-- Phase 0 seed: one household + one child (Azad) so the shelf renders.
-- Idempotent: safe to run on `supabase db reset` many times.
-- IDs are real v4 UUIDs (PRD §4.7 — crypto.randomUUID(), not hand-picked).

insert into public.households (id, name)
values ('4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid, 'Thaker Family')
on conflict (id) do nothing;

insert into public.parents (id, household_id, email, display_name)
values (
  '27252e6f-1957-44bd-abf0-e5dc5d5c31c6'::uuid,
  '4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid,
  'manavpthaker@gmail.com',
  'Papa'
)
on conflict (id) do nothing;

insert into public.children (id, household_id, display_name, band, exclude_terms)
values (
  'e27b2fa0-d16f-4c38-9d97-ed05374167de'::uuid,
  '4ecabfb5-dcce-4c7f-b40d-f94e84e3a427'::uuid,
  'Azad',
  '4-8',
  '[]'::jsonb
)
on conflict (id) do nothing;
