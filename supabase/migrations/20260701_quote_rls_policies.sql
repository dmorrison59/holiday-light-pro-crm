-- Organization-scoped policies for authenticated quote management.
-- These policies are safe to create whether or not RLS is currently enabled.
-- Do not add a broad anonymous SELECT policy: public proposals must remain
-- token-scoped and customer-safe.

drop policy if exists "Organization members can read quotes" on public.quotes;
create policy "Organization members can read quotes" on public.quotes
for select to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quotes.organization_id
));
drop policy if exists "Organization members can create quotes" on public.quotes;
create policy "Organization members can create quotes" on public.quotes
for insert to authenticated with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quotes.organization_id
));
drop policy if exists "Organization members can update quotes" on public.quotes;
create policy "Organization members can update quotes" on public.quotes
for update to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quotes.organization_id
)) with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quotes.organization_id
));
drop policy if exists "Organization members can delete quotes" on public.quotes;
create policy "Organization members can delete quotes" on public.quotes
for delete to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quotes.organization_id
));

drop policy if exists "Organization members can read quote lines" on public.quote_line_items;
create policy "Organization members can read quote lines" on public.quote_line_items
for select to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quote_line_items.organization_id
));
drop policy if exists "Organization members can create quote lines" on public.quote_line_items;
create policy "Organization members can create quote lines" on public.quote_line_items
for insert to authenticated with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quote_line_items.organization_id
));
drop policy if exists "Organization members can update quote lines" on public.quote_line_items;
create policy "Organization members can update quote lines" on public.quote_line_items
for update to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quote_line_items.organization_id
)) with check (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quote_line_items.organization_id
));
drop policy if exists "Organization members can delete quote lines" on public.quote_line_items;
create policy "Organization members can delete quote lines" on public.quote_line_items
for delete to authenticated using (exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id = quote_line_items.organization_id
));
