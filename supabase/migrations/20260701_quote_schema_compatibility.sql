-- Bring older Holiday Light Pro databases up to the quote schema expected by
-- the current application. This migration only adds missing columns,
-- constraints, and indexes; it does not remove or rename data.

alter table public.quotes
  add column if not exists site_visit_id uuid references public.site_visits(id) on delete set null,
  add column if not exists package_id uuid references public.packages(id) on delete set null,
  add column if not exists quote_number text,
  add column if not exists status text not null default 'draft',
  add column if not exists quote_date date not null default current_date,
  add column if not exists expiration_date date,
  add column if not exists subtotal numeric(12, 2) not null default 0,
  add column if not exists discount numeric(12, 2) not null default 0,
  add column if not exists total numeric(12, 2) not null default 0,
  add column if not exists deposit_required numeric(12, 2) not null default 0,
  add column if not exists deposit_type text not null default 'percentage',
  add column if not exists deposit_value numeric(12, 2) not null default 50,
  add column if not exists balance_due numeric(12, 2) not null default 0,
  add column if not exists customer_notes text,
  add column if not exists terms text,
  add column if not exists internal_notes text,
  add column if not exists proposal_token text,
  add column if not exists proposal_viewed_at timestamptz,
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists customer_approval_name text,
  add column if not exists customer_approval_email text,
  add column if not exists customer_decline_reason text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.quotes drop constraint if exists quotes_deposit_type_check;
alter table public.quotes add constraint quotes_deposit_type_check
  check (deposit_type in ('percentage', 'fixed')) not valid;

alter table public.quotes drop constraint if exists quotes_deposit_value_check;
alter table public.quotes add constraint quotes_deposit_value_check
  check (deposit_value >= 0) not valid;

create unique index if not exists quotes_org_number_uidx
  on public.quotes (organization_id, quote_number)
  where quote_number is not null;
create unique index if not exists quotes_proposal_token_uidx
  on public.quotes (proposal_token)
  where proposal_token is not null;

alter table public.quote_line_items
  add column if not exists catalog_item_id uuid references public.catalog_items(id) on delete set null,
  add column if not exists description text,
  add column if not exists quantity numeric(12, 2) not null default 1,
  add column if not exists unit text,
  add column if not exists unit_price numeric(12, 2) not null default 0,
  add column if not exists multiplier numeric(8, 3) not null default 1,
  add column if not exists line_total numeric(12, 2) not null default 0,
  add column if not exists customer_visible boolean not null default true,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists quote_line_items_quote_id_idx on public.quote_line_items (quote_id);
create index if not exists quote_line_items_catalog_item_id_idx on public.quote_line_items (catalog_item_id);

-- Ask PostgREST to immediately recognize the new columns. Supabase also
-- refreshes this cache automatically, but the notification avoids a delay.
notify pgrst, 'reload schema';
