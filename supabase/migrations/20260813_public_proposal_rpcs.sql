-- Public proposal access via tightly-scoped SECURITY DEFINER functions.
-- No broad anonymous SELECT/UPDATE policies on quotes are required.
-- Apply this migration in the Supabase SQL Editor (or via your migration workflow).

-- ---------------------------------------------------------------------------
-- Helper: validate UUID v4 token format
-- ---------------------------------------------------------------------------
create or replace function public.is_valid_proposal_token(p_token text)
returns boolean
language sql
immutable
as $$
  select p_token ~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
$$;

-- ---------------------------------------------------------------------------
-- 1. get_public_proposal(token)
--    Returns a customer-safe JSON payload or null.
--    Also marks the proposal as "viewed" the first time it is opened
--    while still in "sent" status.
-- ---------------------------------------------------------------------------
create or replace function public.get_public_proposal(p_token text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quote public.quotes%rowtype;
  v_now   timestamptz := now();
  v_result json;
begin
  if p_token is null or not public.is_valid_proposal_token(p_token) then
    return null;
  end if;

  select * into v_quote
  from public.quotes
  where proposal_token = p_token;

  if not found then
    return null;
  end if;

  -- Mark as viewed on first open (only while still "sent")
  if v_quote.status = 'sent' then
    update public.quotes
    set
      status             = 'viewed',
      proposal_viewed_at = coalesce(proposal_viewed_at, v_now),
      updated_at         = v_now
    where id = v_quote.id
      and organization_id = v_quote.organization_id
      and status = 'sent'
    returning * into v_quote;
  end if;

  -- Build the safe payload (matches ProposalData shape)
  select json_build_object(
    'quote', json_build_object(
      'id',                    v_quote.id,
      'quote_number',          v_quote.quote_number,
      'status',                v_quote.status,
      'quote_date',            v_quote.quote_date,
      'expiration_date',       v_quote.expiration_date,
      'subtotal',              v_quote.subtotal,
      'discount',              v_quote.discount,
      'total',                 v_quote.total,
      'deposit_required',      v_quote.deposit_required,
      'balance_due',           v_quote.balance_due,
      'customer_notes',        v_quote.customer_notes,
      'terms',                 v_quote.terms,
      'proposal_token',        v_quote.proposal_token,
      'proposal_viewed_at',    v_quote.proposal_viewed_at,
      'proposal_sent_at',      v_quote.proposal_sent_at,
      'approved_at',           v_quote.approved_at,
      'declined_at',           v_quote.declined_at,
      'customer_approval_name', v_quote.customer_approval_name,
      'customer_approval_email',v_quote.customer_approval_email,
      'customer_decline_reason',v_quote.customer_decline_reason
    ),
    'company', (
      select json_build_object(
        'name',     o.name,
        'phone',    o.phone,
        'email',    o.email,
        'website',  o.website,
        'address',  o.address,
        'logo_url', o.logo_url
      )
      from public.organizations o
      where o.id = v_quote.organization_id
    ),
    'customer', (
      select json_build_object(
        'first_name',      c.first_name,
        'last_name',       c.last_name,
        'phone',           c.phone,
        'email',           c.email,
        'billing_address', c.billing_address,
        'billing_street',  c.billing_street,
        'billing_city',    c.billing_city,
        'billing_state',   c.billing_state,
        'billing_zip',     c.billing_zip
      )
      from public.customers c
      where c.id = v_quote.customer_id
        and c.organization_id = v_quote.organization_id
    ),
    'property', (
      select json_build_object(
        'property_name',  p.property_name,
        'address_line_1', p.address_line_1,
        'address_line_2', p.address_line_2,
        'city',           p.city,
        'state',          p.state,
        'zip',            p.zip,
        'property_type',  p.property_type
      )
      from public.properties p
      where p.id = v_quote.property_id
        and p.organization_id = v_quote.organization_id
    ),
    'siteVisit', (
      select case
        when v_quote.site_visit_id is null then null
        else (
          select json_build_object(
            'preferred_style',  sv.preferred_style,
            'preferred_colors', sv.preferred_colors
          )
          from public.site_visits sv
          where sv.id = v_quote.site_visit_id
            and sv.organization_id = v_quote.organization_id
        )
      end
    ),
    'package', (
      select case
        when v_quote.package_id is null then null
        else (
          select json_build_object(
            'name',        pkg.name,
            'description', pkg.description,
            'includedItems', coalesce((
              select json_agg(json_build_object(
                'name',     ci.name,
                'quantity', pi.quantity,
                'unit',     pi.unit,
                'notes',    pi.notes
              ) order by pi.created_at)
              from public.package_items pi
              join public.catalog_items ci
                on ci.id = pi.catalog_item_id
               and ci.organization_id = pi.organization_id
              where pi.package_id = pkg.id
                and pi.organization_id = pkg.organization_id
                and pi.included = true
            ), '[]'::json)
          )
          from public.packages pkg
          where pkg.id = v_quote.package_id
            and pkg.organization_id = v_quote.organization_id
        )
      end
    ),
    'lineItems', coalesce((
      select json_agg(json_build_object(
        'id',          li.id,
        'description', li.description,
        'quantity',    li.quantity,
        'unit',        li.unit,
        'unit_price',  li.unit_price,
        'line_total',  li.line_total,
        'notes',       li.notes
      ) order by li.created_at)
      from public.quote_line_items li
      where li.quote_id = v_quote.id
        and li.organization_id = v_quote.organization_id
        and li.customer_visible = true
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. approve_public_proposal(token, name, email)
-- ---------------------------------------------------------------------------
create or replace function public.approve_public_proposal(
  p_token  text,
  p_name   text,
  p_email  text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quote public.quotes%rowtype;
  v_now   timestamptz := now();
begin
  if p_token is null or not public.is_valid_proposal_token(p_token) then
    return json_build_object('ok', false, 'error', 'Proposal not found.');
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    return json_build_object('ok', false, 'error', 'Enter your name to approve this proposal.');
  end if;

  select * into v_quote
  from public.quotes
  where proposal_token = p_token;

  if not found then
    return json_build_object('ok', false, 'error', 'Proposal not found.');
  end if;

  if v_quote.status in ('approved', 'declined') then
    return json_build_object('ok', false, 'error',
      format('This proposal has already been %s.', v_quote.status));
  end if;

  if v_quote.status = 'expired'
     or (v_quote.expiration_date is not null
         and v_quote.expiration_date < current_date) then
    return json_build_object('ok', false, 'error',
      'This proposal has expired. Please contact the installer.');
  end if;

  update public.quotes
  set
    status                  = 'approved',
    approved_at             = v_now,
    declined_at             = null,
    customer_approval_name  = trim(p_name),
    customer_approval_email = nullif(trim(p_email), ''),
    updated_at              = v_now
  where id = v_quote.id
    and organization_id = v_quote.organization_id
    and status not in ('approved', 'declined');

  if not found then
    return json_build_object('ok', false, 'error',
      'We could not approve this proposal. Please contact the installer.');
  end if;

  -- Soft-update customer status when appropriate
  update public.customers
  set status = 'approved', updated_at = v_now
  where id = v_quote.customer_id
    and organization_id = v_quote.organization_id
    and status in ('lead', 'contacted', 'site_visit_scheduled', 'measured', 'quote_sent');

  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. decline_public_proposal(token, reason)
-- ---------------------------------------------------------------------------
create or replace function public.decline_public_proposal(
  p_token  text,
  p_reason text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quote public.quotes%rowtype;
  v_now   timestamptz := now();
begin
  if p_token is null or not public.is_valid_proposal_token(p_token) then
    return json_build_object('ok', false, 'error', 'Proposal not found.');
  end if;

  select * into v_quote
  from public.quotes
  where proposal_token = p_token;

  if not found then
    return json_build_object('ok', false, 'error', 'Proposal not found.');
  end if;

  if v_quote.status in ('approved', 'declined') then
    return json_build_object('ok', false, 'error',
      format('This proposal has already been %s.', v_quote.status));
  end if;

  update public.quotes
  set
    status                  = 'declined',
    declined_at             = v_now,
    approved_at             = null,
    customer_decline_reason = nullif(trim(p_reason), ''),
    updated_at              = v_now
  where id = v_quote.id
    and organization_id = v_quote.organization_id
    and status not in ('approved', 'declined');

  if not found then
    return json_build_object('ok', false, 'error',
      'We could not decline this proposal. Please contact the installer.');
  end if;

  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
revoke all on function public.is_valid_proposal_token(text) from public, anon;
revoke all on function public.get_public_proposal(text) from public, anon;
revoke all on function public.approve_public_proposal(text, text, text) from public, anon;
revoke all on function public.decline_public_proposal(text, text) from public, anon;

grant execute on function public.is_valid_proposal_token(text) to authenticated;
grant execute on function public.get_public_proposal(text) to anon, authenticated;
grant execute on function public.approve_public_proposal(text, text, text) to anon, authenticated;
grant execute on function public.decline_public_proposal(text, text) to anon, authenticated;