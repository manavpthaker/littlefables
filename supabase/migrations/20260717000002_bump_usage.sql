-- Per-household daily budget counter (PRD D4).
-- Adapted from archive/0003_usage_counters.sql: household-scoped, not global.
-- Called by lib/server/guard.ts via .rpc('bump_usage', { p_household_id, p_kind }).

create or replace function public.bump_usage(p_household_id uuid, p_kind text)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.usage_counters (household_id, day, kind, count)
  values (p_household_id, current_date, p_kind, 1)
  on conflict (household_id, day, kind)
  do update set count = public.usage_counters.count + 1, updated_at = now()
  returning count;
$$;

revoke all on function public.bump_usage(uuid, text) from public;
grant execute on function public.bump_usage(uuid, text) to service_role;
