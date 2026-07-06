-- Holiday Light Pro CRM MVP database foundation
-- Run in the Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  website text,
  address text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text,
  last_name text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  billing_address text,
  billing_street text,
  billing_city text,
  billing_state text,
  billing_zip text,
  service_same_as_billing boolean not null default true,
  service_street text,
  service_city text,
  service_state text,
  service_zip text,
  latitude numeric,
  longitude numeric,
  status text not null default 'lead',
  lead_source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  property_name text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  zip text not null,
  property_type text,
  access_notes text,
  outlet_notes text,
  safety_notes text,
  hoa_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  status text not null default 'new',
  source text,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  desired_install_window text,
  interested_services text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_budget_range check (
    budget_min is null or budget_max is null or budget_max >= budget_min
  )
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  visit_date timestamptz,
  estimator_id uuid references public.profiles(id) on delete set null,
  budget_discussed text,
  preferred_style text,
  preferred_colors text[] not null default '{}',
  customer_present boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  pricing_method text not null,
  unit_type text not null,
  unit_price numeric(12, 2) not null default 0,
  cost numeric(12, 2),
  active boolean not null default true,
  customer_facing boolean not null default true,
  track_inventory boolean not null default false,
  quantity_available numeric(12, 2) not null default 0,
  quantity_reserved numeric(12, 2) not null default 0,
  reorder_threshold numeric(12, 2) not null default 0,
  storage_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_items_nonnegative_values check (
    unit_price >= 0 and
    (cost is null or cost >= 0) and
    quantity_available >= 0 and
    quantity_reserved >= 0 and
    reorder_threshold >= 0
  )
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  zone_name text not null,
  measurement_type text not null,
  quantity numeric(12, 2) not null default 0,
  unit text not null,
  height_level text,
  difficulty text,
  difficulty_multiplier numeric(8, 3) not null default 1,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  included_in_quote boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measurements_nonnegative_values check (
    quantity >= 0 and difficulty_multiplier >= 0
  )
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  base_price numeric(12, 2) not null default 0,
  recommended_budget_min numeric(12, 2),
  recommended_budget_max numeric(12, 2),
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_budget_range check (
    recommended_budget_min is null or
    recommended_budget_max is null or
    recommended_budget_max >= recommended_budget_min
  )
);

create table if not exists public.package_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items(id) on delete restrict,
  quantity numeric(12, 2) not null default 1,
  unit text not null,
  included boolean not null default true,
  optional_addon boolean not null default false,
  price_override numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_items_nonnegative_values check (
    quantity >= 0 and (price_override is null or price_override >= 0)
  )
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  quote_number text,
  status text not null default 'draft',
  quote_date date not null default current_date,
  expiration_date date,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  deposit_required numeric(12, 2) not null default 0,
  deposit_type text not null default 'percentage',
  deposit_value numeric(12, 2) not null default 50,
  balance_due numeric(12, 2) not null default 0,
  customer_notes text,
  terms text,
  internal_notes text,
  proposal_token text unique,
  proposal_viewed_at timestamptz,
  proposal_sent_at timestamptz,
  approved_at timestamptz,
  declined_at timestamptz,
  customer_approval_name text,
  customer_approval_email text,
  customer_decline_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_nonnegative_values check (
    subtotal >= 0 and discount >= 0 and total >= 0 and
    deposit_required >= 0 and deposit_value >= 0 and balance_due >= 0
  )
);

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit text not null,
  unit_price numeric(12, 2) not null default 0,
  multiplier numeric(8, 3) not null default 1,
  line_total numeric(12, 2) not null default 0,
  customer_visible boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_line_items_nonnegative_values check (
    quantity >= 0 and unit_price >= 0 and multiplier >= 0 and line_total >= 0
  )
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  job_number text,
  status text not null default 'approved',
  install_date date,
  install_time_window text,
  takedown_date date,
  takedown_time_window text,
  payment_status text not null default 'unpaid',
  crew_notes text,
  materials_notes text,
  storage_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  event_type text not null,
  event_date date not null,
  start_time time,
  end_time time,
  time_window text,
  status text not null default 'scheduled',
  assigned_user_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_events_valid_times check (
    start_time is null or end_time is null or end_time >= start_time
  )
);

create table if not exists public.job_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit text,
  reserved_quantity numeric(12,2) not null default 0,
  used_quantity numeric(12,2) not null default 0,
  returned_quantity numeric(12,2) not null default 0,
  status text not null default 'Needed',
  customer_visible boolean not null default false,
  source text,
  storage_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  job_id uuid references public.jobs(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  amount numeric(12, 2) not null,
  payment_type text not null,
  status text not null default 'pending',
  payment_date timestamptz,
  payment_method text,
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_positive_amount check (amount > 0)
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  related_type text not null,
  related_id uuid not null,
  file_url text not null,
  file_name text not null,
  file_type text,
  storage_path text,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  photo_type text,
  customer_visible boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organization indexes
create index if not exists profiles_organization_id_idx on public.profiles (organization_id);
create index if not exists organization_pricing_settings_organization_id_idx on public.organization_pricing_settings (organization_id);
create index if not exists customers_organization_id_idx on public.customers (organization_id);
create index if not exists properties_organization_id_idx on public.properties (organization_id);
create index if not exists leads_organization_id_idx on public.leads (organization_id);
create index if not exists site_visits_organization_id_idx on public.site_visits (organization_id);
create index if not exists measurements_organization_id_idx on public.measurements (organization_id);
create index if not exists catalog_items_organization_id_idx on public.catalog_items (organization_id);
create index if not exists packages_organization_id_idx on public.packages (organization_id);
create index if not exists package_items_organization_id_idx on public.package_items (organization_id);
create index if not exists quotes_organization_id_idx on public.quotes (organization_id);
create index if not exists quote_line_items_organization_id_idx on public.quote_line_items (organization_id);
create index if not exists jobs_organization_id_idx on public.jobs (organization_id);
create index if not exists schedule_events_organization_id_idx on public.schedule_events (organization_id);
create index if not exists job_materials_organization_id_idx on public.job_materials (organization_id);
create index if not exists payments_organization_id_idx on public.payments (organization_id);
create index if not exists files_organization_id_idx on public.files (organization_id);

-- Relationship indexes
create index if not exists properties_customer_id_idx on public.properties (customer_id);
create index if not exists leads_customer_id_idx on public.leads (customer_id);
create index if not exists leads_property_id_idx on public.leads (property_id);
create index if not exists site_visits_customer_id_idx on public.site_visits (customer_id);
create index if not exists site_visits_property_id_idx on public.site_visits (property_id);
create index if not exists site_visits_estimator_id_idx on public.site_visits (estimator_id);
create index if not exists measurements_site_visit_id_idx on public.measurements (site_visit_id);
create index if not exists measurements_property_id_idx on public.measurements (property_id);
create index if not exists measurements_catalog_item_id_idx on public.measurements (catalog_item_id);
create index if not exists package_items_package_id_idx on public.package_items (package_id);
create index if not exists package_items_catalog_item_id_idx on public.package_items (catalog_item_id);
create index if not exists quotes_customer_id_idx on public.quotes (customer_id);
create index if not exists quotes_property_id_idx on public.quotes (property_id);
create index if not exists quotes_site_visit_id_idx on public.quotes (site_visit_id);
create index if not exists quotes_package_id_idx on public.quotes (package_id);
create index if not exists quote_line_items_quote_id_idx on public.quote_line_items (quote_id);
create index if not exists quote_line_items_catalog_item_id_idx on public.quote_line_items (catalog_item_id);
create index if not exists jobs_customer_id_idx on public.jobs (customer_id);
create index if not exists jobs_property_id_idx on public.jobs (property_id);
create index if not exists jobs_quote_id_idx on public.jobs (quote_id);
create index if not exists schedule_events_customer_id_idx on public.schedule_events (customer_id);
create index if not exists schedule_events_property_id_idx on public.schedule_events (property_id);
create index if not exists schedule_events_job_id_idx on public.schedule_events (job_id);
create index if not exists job_materials_job_id_idx on public.job_materials (job_id);
create index if not exists job_materials_catalog_item_id_idx on public.job_materials (catalog_item_id);
create index if not exists schedule_events_assigned_user_id_idx on public.schedule_events (assigned_user_id);
create index if not exists payments_customer_id_idx on public.payments (customer_id);
create index if not exists payments_job_id_idx on public.payments (job_id);
create index if not exists payments_quote_id_idx on public.payments (quote_id);
create index if not exists files_related_record_idx on public.files (related_type, related_id);

-- Frequently filtered fields
create index if not exists customers_status_idx on public.customers (organization_id, status);
create index if not exists leads_status_idx on public.leads (organization_id, status);
create index if not exists catalog_items_active_idx on public.catalog_items (organization_id, active);
create index if not exists quotes_status_idx on public.quotes (organization_id, status);
create index if not exists jobs_status_idx on public.jobs (organization_id, status);
create index if not exists jobs_payment_status_idx on public.jobs (organization_id, payment_status);
create index if not exists schedule_events_status_idx on public.schedule_events (organization_id, status);
create index if not exists job_materials_status_idx on public.job_materials (organization_id, status);
create index if not exists schedule_events_event_date_idx on public.schedule_events (organization_id, event_date);
create index if not exists payments_status_idx on public.payments (organization_id, status);

-- Natural uniqueness within each organization
create unique index if not exists catalog_items_org_name_uidx
  on public.catalog_items (organization_id, lower(name));
create unique index if not exists packages_org_name_uidx
  on public.packages (organization_id, lower(name));
create unique index if not exists quotes_org_number_uidx
  on public.quotes (organization_id, quote_number)
  where quote_number is not null;
create unique index if not exists jobs_org_number_uidx
  on public.jobs (organization_id, job_number)
  where job_number is not null;

create unique index if not exists jobs_org_quote_uidx
  on public.jobs (organization_id, quote_id)
  where quote_id is not null;

-- Keep updated_at accurate for every mutable MVP table.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'profiles', 'organization_pricing_settings', 'customers', 'properties', 'leads',
    'site_visits', 'measurements', 'catalog_items', 'packages',
    'package_items', 'quotes', 'quote_line_items', 'jobs',
    'schedule_events', 'job_materials', 'payments', 'files'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

-- Row Level Security policies are intentionally added in a later task.
