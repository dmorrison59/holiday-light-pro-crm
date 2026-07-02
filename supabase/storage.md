# Supabase Storage setup

Create a **private** bucket named `holiday-light-files` in Supabase Storage before testing uploads. Keep the bucket private; authenticated pages create short-lived signed URLs for previews.

Files use this path convention:

```text
{organization_id}/{related_type}/{related_id}/{timestamp}-{safe_file_name}
```

The application uses the signed-in user's anonymous/authenticated Supabase client. Never add a service-role key to a `NEXT_PUBLIC_` environment variable.

If Storage Row Level Security is enabled, add policies on `storage.objects` that allow authenticated users to select, insert, and delete only when:

- `bucket_id = 'holiday-light-files'`
- the first folder in `name` is the user's organization ID
- that organization is resolved through `public.profiles.user_id = auth.uid()`

Run policies equivalent to the following in the Supabase SQL editor (rename them if those names already exist):

```sql
create policy "Organization members can read holiday files"
on storage.objects for select to authenticated
using (bucket_id = 'holiday-light-files' and exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id::text = (storage.foldername(name))[1]
));

create policy "Organization members can upload holiday files"
on storage.objects for insert to authenticated
with check (bucket_id = 'holiday-light-files' and exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id::text = (storage.foldername(name))[1]
));

create policy "Organization members can delete holiday files"
on storage.objects for delete to authenticated
using (bucket_id = 'holiday-light-files' and exists (
  select 1 from public.profiles p where p.user_id = auth.uid()
  and p.organization_id::text = (storage.foldername(name))[1]
));
```

The app needs only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The app never exposes raw storage paths on public proposal pages, and uploaded quote files remain internal by default. Never expose the service-role key in browser code or a `NEXT_PUBLIC_` variable.
