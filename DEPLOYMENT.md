# Deployment Guide

This guide prepares Holiday Light Pro CRM for a production deployment using GitHub, Vercel, and Supabase.

## 1. Preflight

From the project root:

```bash
npm install
npm run build
```

The project currently has no separate lint script. `npm run build` performs the production compilation and TypeScript check.

Do not commit `.env.local`. The repository ignores `.env*` while explicitly allowing only the placeholder `.env.example` and `.env.local.example` files.

## 2. Vercel environment variables

Configure these for Production, Preview, and Development as appropriate:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

No service-role key is required by this application. Never create a `NEXT_PUBLIC_` service-role variable; values with that prefix are exposed to browser code.

## 3. Supabase database

For a new project, run `supabase/schema.sql` first. Then run every migration below manually in this order. They are additive/idempotent where practical:

1. `supabase/migrations/20260629_site_visits_budget_text.sql`
2. `supabase/migrations/20260630_customer_proposals.sql`
3. `supabase/migrations/20260630_file_metadata.sql`
4. `supabase/migrations/20260630_jobs_one_per_quote.sql`
5. `supabase/migrations/20260630_payment_details.sql`
6. `supabase/migrations/20260630_quote_deposits.sql`
7. `supabase/migrations/20260701_job_materials.sql`
8. `supabase/migrations/20260701_quote_rls_policies.sql`
9. `supabase/migrations/20260701_quote_schema_compatibility.sql`
10. `supabase/migrations/20260701_schedule_event_dedup.sql`

The quote compatibility migration reloads the PostgREST schema cache. Do not skip it when upgrading an older database.

## 4. Supabase Storage

Create a bucket named `holiday-light-files` and keep it **private**.

Apply the authenticated organization-scoped select, insert, and delete policies documented in `supabase/storage.md`. Storage object paths use:

```text
{organization_id}/{related_type}/{related_id}/{timestamp}-{safe_file_name}
```

Uploads go directly from the authenticated browser to Supabase Storage. The application does not send file bodies through Next.js Server Actions. Private previews use short-lived signed URLs.

## 5. Supabase Authentication URLs

In Supabase Authentication URL Configuration:

- Set the production Site URL to the final Vercel or custom domain.
- Add `https://YOUR-DOMAIN/auth/callback` to allowed redirect URLs.
- Keep `http://localhost:3000/auth/callback` for local development.
- Add the Vercel preview callback pattern only if preview authentication is required.

## 6. Public proposal security

Public proposals use high-entropy UUID tokens. The assembly layer returns only company/contact information, customer-safe quote fields, customer-visible line items, and selected package/site-visit presentation details. Internal notes, organization IDs, storage paths, and uploaded internal files are not included.

After changing database RLS, retest proposal viewing, approval, and decline while signed out. Do not add a broad anonymous `quotes` table policy.

## 7. Route smoke test

After deployment, verify:

- `/dashboard`
- `/customers`
- `/site-visits`
- `/quotes` and `/quotes/new`
- `/proposal/[token]` while signed out
- `/jobs` and `/jobs/[id]/materials`
- `/schedule` and `/schedule/new`
- `/catalog`
- `/packages`
- `/settings`

Also test invoice/material printing and a mobile viewport.

## Final launch checklist

- [ ] Push the project to a private GitHub repository.
- [ ] Connect the repository to Vercel.
- [ ] Add the two public Supabase environment variables in Vercel.
- [ ] Run `supabase/schema.sql` for a new database and all migrations in order.
- [ ] Create the private `holiday-light-files` bucket and Storage policies.
- [ ] Update Supabase Auth Site URL and redirect URLs.
- [ ] Deploy and test signup, login, logout, and onboarding.
- [ ] Test quote creation, public proposal approval, job conversion, and invoice.
- [ ] Test direct file upload, signed preview, and deletion.
- [ ] Test materials generation/reservation and schedule updates.
- [ ] Run one final `npm run build` before the production release.
