alter table public.quotes
  add column if not exists deposit_type text not null default 'percentage',
  add column if not exists deposit_value numeric(12, 2) not null default 50;

alter table public.quotes drop constraint if exists quotes_deposit_type_check;
alter table public.quotes add constraint quotes_deposit_type_check
  check (deposit_type in ('percentage', 'fixed'));

alter table public.quotes drop constraint if exists quotes_deposit_value_check;
alter table public.quotes add constraint quotes_deposit_value_check
  check (deposit_value >= 0);
