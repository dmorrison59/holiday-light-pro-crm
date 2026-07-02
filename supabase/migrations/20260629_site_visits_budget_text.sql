-- Site visit budgets are field notes/ranges, not accounting amounts.
alter table public.site_visits
  alter column budget_discussed type text
  using budget_discussed::text;
