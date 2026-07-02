# Holiday Light Pro CRM

Mobile-friendly contractor CRM for holiday-light sales, field documentation, quoting, jobs, scheduling, invoicing, payments, and file storage.

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and provide:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

Never expose a Supabase service-role key in browser code or any `NEXT_PUBLIC_` variable.

## Supabase setup

For a new Supabase project:

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Run each file in `supabase/migrations` in filename order. Migrations use safe `if exists`/`if not exists` patterns where appropriate and must be applied manually.
3. Follow `supabase/storage.md` to create the private `holiday-light-files` bucket and organization-scoped read, upload, and delete policies.
4. In Supabase Authentication, configure the local callback URL and later add the production callback/domain URLs.

The browser uses only the public URL and anonymous key. Row-level security and organization-scoped queries protect authenticated data.

The materials workflow requires `supabase/migrations/20260701_job_materials.sql`. Apply it before opening job detail pages after this feature is deployed.

## Demo data

Sign in to an empty organization, open **Settings**, and choose **Create Demo Data**. This explicitly creates the Sarah Johnson walkthrough. It does not run automatically, never deletes data, and refuses to add demo records when customer data already exists.

The walkthrough includes catalog inventory, a package, customer, property, site visit, measurements, approved quote, scheduled job, install/takedown/service events, and a deposit payment.

## Verification

Run the production check before deployment:

```bash
npm run build
```

There is currently no lint script. The Next.js build includes TypeScript validation.

Suggested manual smoke test:

1. Sign up, complete onboarding, and create demo data from Settings.
2. Review Dashboard → Sarah Johnson → property → site visit → measurements.
3. Review catalog, package, quote, proposal preview, job, schedule, payment, and invoice.
4. Upload and delete a photo under 10 MB.
5. Verify proposal and invoice print previews.
6. Repeat the main pages at a mobile viewport.
7. Confirm public proposal links work while signed out and expose only customer-safe content.

## Deployment preparation

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete migration order, Storage policies, Auth URL configuration, security notes, route smoke test, and final launch checklist.

1. Push the project to a private GitHub repository.
2. Import the repository into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
4. Deploy and add the production domain to Supabase Auth redirect URLs.
5. Test authentication, proposal links, uploads, private signed previews, schedule changes, and invoice printing in production.
6. Add a custom production domain when ready.

Do not commit `.env.local`, database passwords, access tokens, or service-role keys.
