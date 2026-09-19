-- Seasonal renewal quote lineage and authenticated, tenant-scoped creation.
-- Apply only after 20260717_tenant_scoped_rls.sql.

alter table public.quotes
  add column if not exists renewal_source_job_id uuid,
  add column if not exists renewal_season integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quotes_renewal_source_job_fkey'
      and conrelid = 'public.quotes'::regclass
  ) then
    alter table public.quotes
      add constraint quotes_renewal_source_job_fkey
      foreign key (renewal_source_job_id)
      references public.jobs(id)
      on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'quotes_renewal_fields_together_check'
      and conrelid = 'public.quotes'::regclass
  ) then
    alter table public.quotes
      add constraint quotes_renewal_fields_together_check
      check (
        (renewal_source_job_id is null and renewal_season is null)
        or
        (renewal_source_job_id is not null and renewal_season is not null)
      );
  end if;
end
$$;

create unique index if not exists quotes_org_renewal_source_season_uidx
  on public.quotes (organization_id, renewal_source_job_id, renewal_season)
  where renewal_source_job_id is not null;

create index if not exists quotes_org_renewal_season_idx
  on public.quotes (organization_id, renewal_season, status)
  where renewal_source_job_id is not null;

create or replace function public.enforce_renewal_quote_integrity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and (
    old.renewal_source_job_id is distinct from new.renewal_source_job_id
    or old.renewal_season is distinct from new.renewal_season
  ) then
    raise exception 'Renewal quote lineage cannot be changed.' using errcode = '22023';
  end if;

  if new.renewal_source_job_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE' and (
    old.customer_id is distinct from new.customer_id
    or old.property_id is distinct from new.property_id
  ) then
    raise exception 'A renewal quote must stay with its source customer and property.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.jobs job
    where job.id = new.renewal_source_job_id
      and job.organization_id = new.organization_id
      and job.customer_id = new.customer_id
      and job.property_id = new.property_id
  ) then
    raise exception 'The renewal source job is not valid for this organization.' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_renewal_quote_integrity on public.quotes;
create trigger enforce_renewal_quote_integrity
before insert or update on public.quotes
for each row execute function public.enforce_renewal_quote_integrity();

create or replace function public.create_renewal_quote(
  p_source_job_id uuid,
  p_renewal_season integer
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_organization_id uuid;
  v_source_job public.jobs%rowtype;
  v_source_quote public.quotes%rowtype;
  v_source_season integer;
  v_existing_quote_id uuid;
  v_new_quote_id uuid := gen_random_uuid();
  v_quote_number text;
begin
  v_organization_id := public.current_user_organization_id();

  if auth.uid() is null or v_organization_id is null then
    raise exception 'A signed-in organization member is required.' using errcode = '42501';
  end if;

  if p_renewal_season is null
     or p_renewal_season <> extract(year from current_date)::integer then
    raise exception 'Renewal quotes can only be created for the current season.' using errcode = '22023';
  end if;

  select job.*
  into v_source_job
  from public.jobs job
  where job.id = p_source_job_id
    and job.organization_id = v_organization_id
  for update;

  if not found then
    raise exception 'Eligible source job not found.' using errcode = 'P0002';
  end if;

  if v_source_job.status = 'canceled' or v_source_job.quote_id is null then
    raise exception 'This job is not eligible for renewal.' using errcode = '22023';
  end if;

  select quote.*
  into v_source_quote
  from public.quotes quote
  where quote.id = v_source_job.quote_id
    and quote.organization_id = v_organization_id
    and quote.customer_id = v_source_job.customer_id
    and quote.property_id = v_source_job.property_id;

  if not found then
    raise exception 'This job does not have a valid source quote.' using errcode = '22023';
  end if;

  v_source_season := extract(
    year from coalesce(v_source_job.install_date, v_source_quote.quote_date)
  )::integer;

  if v_source_season >= p_renewal_season then
    raise exception 'The source job must be from a prior season.' using errcode = '22023';
  end if;

  if not (
    v_source_job.status in ('installed', 'takedown_complete', 'stored', 'complete')
    or exists (
      select 1
      from public.schedule_events event
      where event.organization_id = v_organization_id
        and event.job_id = v_source_job.id
        and event.event_type in ('install', 'takedown')
        and event.status = 'completed'
    )
  ) then
    raise exception 'The source job must have completed or stored work.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.customers customer
    where customer.id = v_source_job.customer_id
      and customer.organization_id = v_organization_id
  ) then
    raise exception 'The source customer is not valid.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.properties property
    where property.id = v_source_job.property_id
      and property.organization_id = v_organization_id
      and property.customer_id = v_source_job.customer_id
  ) then
    raise exception 'The source property is not valid.' using errcode = '22023';
  end if;

  if v_source_quote.site_visit_id is not null and not exists (
    select 1
    from public.site_visits visit
    where visit.id = v_source_quote.site_visit_id
      and visit.organization_id = v_organization_id
      and visit.customer_id = v_source_job.customer_id
      and visit.property_id = v_source_job.property_id
  ) then
    raise exception 'The source site visit is not valid.' using errcode = '22023';
  end if;

  if v_source_quote.package_id is not null and not exists (
    select 1
    from public.packages package
    where package.id = v_source_quote.package_id
      and package.organization_id = v_organization_id
  ) then
    raise exception 'The source package is not valid.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.quote_line_items line
    where line.quote_id = v_source_quote.id
      and line.organization_id = v_organization_id
  ) or exists (
    select 1
    from public.quote_line_items line
    where line.quote_id = v_source_quote.id
      and line.organization_id = v_organization_id
      and line.catalog_item_id is not null
      and not exists (
        select 1
        from public.catalog_items item
        where item.id = line.catalog_item_id
          and item.organization_id = v_organization_id
      )
  ) then
    raise exception 'The source quote lines are not valid.' using errcode = '22023';
  end if;

  select quote.id
  into v_existing_quote_id
  from public.quotes quote
  where quote.organization_id = v_organization_id
    and quote.renewal_source_job_id = v_source_job.id
    and quote.renewal_season = p_renewal_season
  limit 1;

  if v_existing_quote_id is not null then
    return v_existing_quote_id;
  end if;

  v_quote_number := format(
    'Q-%s-%s',
    p_renewal_season,
    upper(substr(replace(v_new_quote_id::text, '-', ''), 1, 8))
  );

  insert into public.quotes (
    id,
    organization_id,
    customer_id,
    property_id,
    site_visit_id,
    package_id,
    quote_number,
    status,
    quote_date,
    expiration_date,
    subtotal,
    discount,
    total,
    deposit_required,
    deposit_type,
    deposit_value,
    balance_due,
    customer_notes,
    terms,
    internal_notes,
    renewal_source_job_id,
    renewal_season
  ) values (
    v_new_quote_id,
    v_organization_id,
    v_source_quote.customer_id,
    v_source_quote.property_id,
    v_source_quote.site_visit_id,
    v_source_quote.package_id,
    v_quote_number,
    'draft',
    current_date,
    current_date + 14,
    v_source_quote.subtotal,
    v_source_quote.discount,
    v_source_quote.total,
    v_source_quote.deposit_required,
    v_source_quote.deposit_type,
    v_source_quote.deposit_value,
    v_source_quote.balance_due,
    v_source_quote.customer_notes,
    v_source_quote.terms,
    v_source_quote.internal_notes,
    v_source_job.id,
    p_renewal_season
  );

  insert into public.quote_line_items (
    organization_id,
    quote_id,
    catalog_item_id,
    description,
    quantity,
    unit,
    unit_price,
    multiplier,
    line_total,
    customer_visible,
    notes
  )
  select
    v_organization_id,
    v_new_quote_id,
    line.catalog_item_id,
    line.description,
    line.quantity,
    line.unit,
    line.unit_price,
    line.multiplier,
    line.line_total,
    line.customer_visible,
    line.notes
  from public.quote_line_items line
  where line.quote_id = v_source_quote.id
    and line.organization_id = v_organization_id
  order by line.created_at, line.id;

  return v_new_quote_id;
exception
  when unique_violation then
    select quote.id
    into v_existing_quote_id
    from public.quotes quote
    where quote.organization_id = v_organization_id
      and quote.renewal_source_job_id = p_source_job_id
      and quote.renewal_season = p_renewal_season
    limit 1;

    if v_existing_quote_id is not null then
      return v_existing_quote_id;
    end if;

    raise;
end;
$$;

revoke all on function public.create_renewal_quote(uuid, integer) from public, anon, authenticated;
grant execute on function public.create_renewal_quote(uuid, integer) to authenticated;

revoke all on function public.enforce_renewal_quote_integrity() from public, anon, authenticated;

notify pgrst, 'reload schema';
