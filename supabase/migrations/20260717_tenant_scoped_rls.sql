-- Replace permissive authenticated policies with organization-scoped access.
-- Existing policies on job_materials, organization_pricing_settings, quotes,
-- and quote_line_items are intentionally left unchanged.

alter table public.organizations
  add column if not exists created_by uuid references auth.users(id) on delete set null
  default auth.uid();

update public.organizations organization
set created_by = (
  select profile.user_id
  from public.profiles profile
  where profile.organization_id = organization.id
  order by case when profile.role = 'owner' then 0 else 1 end, profile.created_at
  limit 1
)
where organization.created_by is null;

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.organization_id
  from public.profiles profile
  where profile.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_organization_owner(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.user_id = auth.uid()
      and profile.organization_id = target_organization_id
      and profile.role = 'owner'
  )
$$;

revoke all on function public.current_user_organization_id() from public, anon;
revoke all on function public.is_organization_owner(uuid) from public, anon;
grant execute on function public.current_user_organization_id() to authenticated;
grant execute on function public.is_organization_owner(uuid) to authenticated;

do $$
declare
  target_table text;
  broad_policy record;
begin
  foreach target_table in array array[
    'catalog_items', 'customers', 'files', 'jobs', 'leads', 'measurements',
    'organizations', 'package_items', 'packages', 'payments', 'profiles',
    'properties', 'schedule_events', 'site_visits'
  ]
  loop
    for broad_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
        and 'authenticated' = any(roles)
        and (
          regexp_replace(coalesce(qual, ''), '[[:space:]()]', '', 'g') = 'true'
          or regexp_replace(coalesce(with_check, ''), '[[:space:]()]', '', 'g') = 'true'
        )
    loop
      execute format('drop policy if exists %I on public.%I', broad_policy.policyname, target_table);
    end loop;
  end loop;
end
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'catalog_items', 'customers', 'files', 'jobs', 'leads', 'measurements',
    'package_items', 'packages', 'payments', 'properties', 'schedule_events',
    'site_visits'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);

    execute format('drop policy if exists %I on public.%I', 'Tenant members can select ' || target_table, target_table);
    execute format(
      'create policy %I on public.%I for select to authenticated using (organization_id = (select public.current_user_organization_id()))',
      'Tenant members can select ' || target_table,
      target_table
    );

    execute format('drop policy if exists %I on public.%I', 'Tenant members can insert ' || target_table, target_table);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (organization_id = (select public.current_user_organization_id()))',
      'Tenant members can insert ' || target_table,
      target_table
    );

    execute format('drop policy if exists %I on public.%I', 'Tenant members can update ' || target_table, target_table);
    execute format(
      'create policy %I on public.%I for update to authenticated using (organization_id = (select public.current_user_organization_id())) with check (organization_id = (select public.current_user_organization_id()))',
      'Tenant members can update ' || target_table,
      target_table
    );

    execute format('drop policy if exists %I on public.%I', 'Tenant members can delete ' || target_table, target_table);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (organization_id = (select public.current_user_organization_id()))',
      'Tenant members can delete ' || target_table,
      target_table
    );
  end loop;
end
$$;

alter table public.organizations enable row level security;

drop policy if exists "Tenant members can select organizations" on public.organizations;
create policy "Tenant members can select organizations"
on public.organizations for select to authenticated
using (
  id = (select public.current_user_organization_id())
  or (
    (select public.current_user_organization_id()) is null
    and created_by = auth.uid()
  )
);

drop policy if exists "New users can create their organization" on public.organizations;
create policy "New users can create their organization"
on public.organizations for insert to authenticated
with check (
  (select public.current_user_organization_id()) is null
  and created_by = auth.uid()
);

drop policy if exists "Owners can update their organization" on public.organizations;
create policy "Owners can update their organization"
on public.organizations for update to authenticated
using (public.is_organization_owner(id))
with check (public.is_organization_owner(id));

drop policy if exists "Owners can delete their organization" on public.organizations;
create policy "Owners can delete their organization"
on public.organizations for delete to authenticated
using (
  public.is_organization_owner(id)
  or (
    (select public.current_user_organization_id()) is null
    and created_by = auth.uid()
  )
);

alter table public.profiles enable row level security;

drop policy if exists "Tenant members can select profiles" on public.profiles;
create policy "Tenant members can select profiles"
on public.profiles for select to authenticated
using (
  organization_id = (select public.current_user_organization_id())
  or user_id = auth.uid()
);

drop policy if exists "Users can create their onboarding profile" on public.profiles;
create policy "Users can create their onboarding profile"
on public.profiles for insert to authenticated
with check (
  user_id = auth.uid()
  and (
    organization_id = (select public.current_user_organization_id())
    or (
      (select public.current_user_organization_id()) is null
      and exists (
        select 1
        from public.organizations organization
        where organization.id = profiles.organization_id
          and organization.created_by = auth.uid()
      )
    )
  )
);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and organization_id = (select public.current_user_organization_id())
);

drop policy if exists "Users can delete their profile" on public.profiles;
create policy "Users can delete their profile"
on public.profiles for delete to authenticated
using (user_id = auth.uid());
