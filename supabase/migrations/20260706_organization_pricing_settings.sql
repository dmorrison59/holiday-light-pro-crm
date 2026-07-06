create table if not exists public.organization_pricing_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  roofline_price numeric(12, 2),
  ridge_line_price numeric(12, 2),
  walkway_price numeric(12, 2),
  driveway_price numeric(12, 2),
  garland_price numeric(12, 2),
  wreath_price numeric(12, 2),
  tree_price numeric(12, 2),
  shrub_price numeric(12, 2),
  peak_gable_price numeric(12, 2),
  custom_labor_hourly_rate numeric(12, 2),
  removal_price numeric(12, 2),
  removal_included boolean not null default true,
  storage_price numeric(12, 2),
  storage_included boolean not null default false,
  minimum_job_price numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_pricing_settings_nonnegative check (
    (roofline_price is null or roofline_price >= 0) and
    (ridge_line_price is null or ridge_line_price >= 0) and
    (walkway_price is null or walkway_price >= 0) and
    (driveway_price is null or driveway_price >= 0) and
    (garland_price is null or garland_price >= 0) and
    (wreath_price is null or wreath_price >= 0) and
    (tree_price is null or tree_price >= 0) and
    (shrub_price is null or shrub_price >= 0) and
    (peak_gable_price is null or peak_gable_price >= 0) and
    (custom_labor_hourly_rate is null or custom_labor_hourly_rate >= 0) and
    (removal_price is null or removal_price >= 0) and
    (storage_price is null or storage_price >= 0) and
    (minimum_job_price is null or minimum_job_price >= 0)
  )
);

create index if not exists organization_pricing_settings_organization_id_idx
  on public.organization_pricing_settings (organization_id);

drop trigger if exists set_updated_at on public.organization_pricing_settings;
create trigger set_updated_at before update on public.organization_pricing_settings
for each row execute function public.set_updated_at();

alter table public.organization_pricing_settings enable row level security;

drop policy if exists "Organization members can read pricing settings" on public.organization_pricing_settings;
create policy "Organization members can read pricing settings" on public.organization_pricing_settings
for select to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = organization_pricing_settings.organization_id
));

drop policy if exists "Organization members can create pricing settings" on public.organization_pricing_settings;
create policy "Organization members can create pricing settings" on public.organization_pricing_settings
for insert to authenticated with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = organization_pricing_settings.organization_id
));

drop policy if exists "Organization members can update pricing settings" on public.organization_pricing_settings;
create policy "Organization members can update pricing settings" on public.organization_pricing_settings
for update to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = organization_pricing_settings.organization_id
)) with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = organization_pricing_settings.organization_id
));

drop policy if exists "Organization members can delete pricing settings" on public.organization_pricing_settings;
create policy "Organization members can delete pricing settings" on public.organization_pricing_settings
for delete to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = organization_pricing_settings.organization_id
));
