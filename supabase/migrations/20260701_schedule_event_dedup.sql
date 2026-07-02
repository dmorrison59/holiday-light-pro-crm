-- Prevent duplicate install/takedown events for the same job while allowing
-- unrelated manual events. Run manually in the Supabase SQL editor.
create unique index if not exists schedule_events_job_work_type_unique
  on public.schedule_events (organization_id, job_id, event_type)
  where job_id is not null and event_type in ('install', 'takedown');

create index if not exists schedule_events_org_date_idx
  on public.schedule_events (organization_id, event_date);
