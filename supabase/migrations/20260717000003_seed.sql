-- Phase 0 seed: one household + one child (Azad) so the shelf renders.
-- Idempotent: safe to run on `supabase db reset` many times.
-- The parent row is a placeholder — auth_user_id fills on first magic-link sign-in.

insert into public.households (id, name)
values ('00000000-0000-0000-0000-000000000001'::uuid, 'Thaker Family')
on conflict (id) do nothing;

insert into public.parents (id, household_id, email, display_name)
values (
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'manavpthaker@gmail.com',
  'Papa'
)
on conflict (id) do nothing;

insert into public.children (id, household_id, display_name, band, exclude_terms)
values (
  '00000000-0000-0000-0000-000000000100'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Azad',
  '4-8',
  '[]'::jsonb
)
on conflict (id) do nothing;
