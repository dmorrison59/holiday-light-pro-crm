-- Read-only live RLS audit. Run in the Supabase SQL Editor and export the result.
-- This changes no schemas, policies, or data.
with public_tables as (
  select c.oid, n.nspname as schema_name, c.relname as table_name,
         c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
), policies as (
  select schemaname as schema_name, tablename as table_name, policyname,
         permissive, roles, cmd, qual as using_expression,
         with_check as with_check_expression
  from pg_policies
  where schemaname = 'public'
)
select t.schema_name, t.table_name, t.rls_enabled, t.rls_forced,
       p.policyname, p.permissive, p.roles, p.cmd,
       p.using_expression, p.with_check_expression
from public_tables t
left join policies p using (schema_name, table_name)
order by t.table_name, p.policyname;
