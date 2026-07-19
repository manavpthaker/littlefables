-- Local-stack parity with hosted Supabase's default privileges.
--
-- On the hosted platform, anon / authenticated / service_role receive
-- grants on public-schema objects automatically (RLS is what actually
-- gates row access). Recent Supabase CLI local stacks do not apply the
-- same defaults to migration-created tables, so every PostgREST request
-- in CI dies with "permission denied for table books" — for the secret
-- key too. Make the grants explicit so local/CI behaves like production.
--
-- Function grants are NOT broadened here: 0002's revoke-all +
-- grant-to-service_role on bump_usage stays the source of truth.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
