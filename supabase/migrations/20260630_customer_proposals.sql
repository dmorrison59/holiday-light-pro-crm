alter table public.quotes
  add column if not exists proposal_token text,
  add column if not exists proposal_viewed_at timestamptz,
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists customer_approval_name text,
  add column if not exists customer_approval_email text,
  add column if not exists customer_decline_reason text;

create unique index if not exists quotes_proposal_token_uidx
  on public.quotes (proposal_token)
  where proposal_token is not null;

-- If Row Level Security is enabled, add narrowly scoped SECURITY DEFINER RPCs
-- for token lookup/decision updates or equivalent token-based policies. Never
-- expose a service-role key to the browser.
