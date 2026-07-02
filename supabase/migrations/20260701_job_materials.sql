create table if not exists public.job_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity >= 0),
  unit text,
  reserved_quantity numeric(12,2) not null default 0 check (reserved_quantity >= 0),
  used_quantity numeric(12,2) not null default 0 check (used_quantity >= 0),
  returned_quantity numeric(12,2) not null default 0 check (returned_quantity >= 0),
  status text not null default 'Needed',
  customer_visible boolean not null default false,
  source text,
  storage_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_materials_organization_id_idx on public.job_materials (organization_id);
create index if not exists job_materials_job_id_idx on public.job_materials (job_id);
create index if not exists job_materials_catalog_item_id_idx on public.job_materials (catalog_item_id);
create index if not exists job_materials_status_idx on public.job_materials (organization_id, status);

drop trigger if exists set_updated_at on public.job_materials;
create trigger set_updated_at before update on public.job_materials
for each row execute function public.set_updated_at();

alter table public.job_materials enable row level security;

drop policy if exists "Organization members can read job materials" on public.job_materials;
create policy "Organization members can read job materials" on public.job_materials
for select to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = job_materials.organization_id
));

drop policy if exists "Organization members can create job materials" on public.job_materials;
create policy "Organization members can create job materials" on public.job_materials
for insert to authenticated with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = job_materials.organization_id
));

drop policy if exists "Organization members can update job materials" on public.job_materials;
create policy "Organization members can update job materials" on public.job_materials
for update to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = job_materials.organization_id
)) with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = job_materials.organization_id
));

drop policy if exists "Organization members can delete job materials" on public.job_materials;
create policy "Organization members can delete job materials" on public.job_materials
for delete to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = job_materials.organization_id
));
