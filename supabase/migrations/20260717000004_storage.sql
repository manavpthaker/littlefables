-- Storage buckets (PRD D5 art pipeline + D9 retells retention).
-- art-candidates: private. Parent-approved images promote into art-live.
-- art-live: public read; only service-role writes (parent approval action).
-- retells: private, path-prefixed by child_id; parent-visible + deletable.

insert into storage.buckets (id, name, public)
values ('art-candidates', 'art-candidates', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('art-live', 'art-live', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('retells', 'retells', false)
on conflict (id) do nothing;

-- retells: reads restricted by child_id prefix mapped to parent's household.
-- Path convention: <child_id>/<retell_id>.<ext>. Parent auth verified via
-- child_id ∈ parent's household children.
create policy "parent reads own retells"
on storage.objects for select
using (
  bucket_id = 'retells'
  and (
    split_part(name, '/', 1)::uuid in (
      select id from public.children where household_id = public.current_parent_household_id()
    )
  )
);
