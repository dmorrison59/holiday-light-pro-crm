alter table public.files
  add column if not exists storage_path text,
  add column if not exists file_size bigint,
  add column if not exists mime_type text,
  add column if not exists uploaded_by uuid references auth.users(id) on delete set null,
  add column if not exists photo_type text,
  add column if not exists customer_visible boolean not null default false;
