do $$
begin
  if not exists (
    select 1
    from public.jobs
    where quote_id is not null
    group by organization_id, quote_id
    having count(*) > 1
  ) then
    create unique index if not exists jobs_org_quote_uidx
      on public.jobs (organization_id, quote_id)
      where quote_id is not null;
  else
    raise notice 'jobs_org_quote_uidx was not created because duplicate quote-linked jobs already exist; resolve them before re-running this migration.';
  end if;
end $$;
