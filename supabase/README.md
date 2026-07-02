# Supabase database setup

This directory contains the database foundation for Holiday Light Pro CRM. It creates the MVP tables and sample catalog/package data only. Authentication workflows and Row Level Security policies are intentionally deferred to a later task.

## 1. Create a Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a project.
2. Wait for the database to finish provisioning.
3. Open **Project Settings → API** and copy the project URL and publishable/anonymous key.

## 2. Configure local environment variables

Copy `.env.local.example` to `.env.local`, then add the project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env.local` or a service-role key. The anonymous key is the only key expected by the current client utilities.

## 3. Apply the schema

In the Supabase dashboard, open **SQL Editor**, create a query, paste the contents of `schema.sql`, and run it. The script creates tables, foreign keys, indexes, and automatic `updated_at` triggers.

For CLI-based projects, copy these SQL files into your normal migration workflow or run the schema with the Supabase CLI against your linked development project.

If your database was created before Task 6, also run `migrations/20260629_site_visits_budget_text.sql`. It allows site visit budgets to hold practical ranges such as `$1,500–$2,000`.

If your database was created before Task 10, run `migrations/20260630_quote_deposits.sql`. It safely adds percentage/fixed deposit fields; existing quotes receive the defaults `percentage` and `50`.

Before testing Task 11 proposal links, run `migrations/20260630_customer_proposals.sql`. It adds secure proposal tokens, customer decision details, and sent/viewed/approved/declined timestamps without changing existing quote data. The migration also documents the extra server-side access work required if Row Level Security is enabled later.

Before testing Task 12 quote-to-job conversion, run `migrations/20260630_jobs_one_per_quote.sql`. It safely enforces the MVP rule that one approved quote can create only one job.

Before testing Task 13 manual payments, run `migrations/20260630_payment_details.sql`. It safely adds payment method and check/reference fields to existing payment records.

Before testing Task 14 uploads, run `migrations/20260630_file_metadata.sql`, then follow `storage.md` to create the private `holiday-light-files` bucket and organization-aware Storage policies.

Before testing Task 15 scheduling, run `migrations/20260701_schedule_event_dedup.sql`. It safely adds a date index and prevents duplicate install/takedown events for the same job.

Before testing materials and inventory reservations, run `migrations/20260701_job_materials.sql`. It creates the `job_materials` table, indexes, updated-at trigger, and organization-scoped RLS policies.

Run `migrations/20260701_quote_rls_policies.sql` to add authenticated organization-scoped policies for quotes and quote line items. It intentionally does not add a broad anonymous quote policy.

If the project was created before quote deposits/proposals were added, run `migrations/20260701_quote_schema_compatibility.sql`. It safely adds every quote and line-item column used by the current app and reloads the PostgREST schema cache.

## 4. Add seed data

Create at least one row in `organizations`, then paste and run `seed.sql` in the SQL Editor. By default, the seed targets the oldest organization. Edit the `target_organization` CTE to select a specific organization before using it in a shared database.

The seed is repeatable: existing catalog and package names for the target organization are skipped.

## Security note

The schema does not enable Row Level Security yet. Task 3 adds authentication and organization-aware application queries, but those checks are not a substitute for database policies. Before exposing real customer data, add RLS policies that derive the current user's organization through `profiles` and restrict every business table to that `organization_id`.

For local signup testing, either disable **Confirm email** in the Supabase Auth settings or follow the confirmation link, which returns through `/auth/callback` before onboarding.
