alter table public.payments
  add column if not exists payment_method text,
  add column if not exists reference_number text;
