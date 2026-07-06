-- Add structured billing and service/install addresses without removing the
-- legacy billing_address column used by existing customer records.
alter table public.customers
  add column if not exists billing_street text,
  add column if not exists billing_city text,
  add column if not exists billing_state text,
  add column if not exists billing_zip text,
  add column if not exists service_same_as_billing boolean not null default true,
  add column if not exists service_street text,
  add column if not exists service_city text,
  add column if not exists service_state text,
  add column if not exists service_zip text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;
