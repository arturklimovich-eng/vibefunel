create table public.payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'solidgate', 'mock')),
  provider_ref text not null check (char_length(provider_ref) between 1 and 255),
  run_id text not null check (run_id ~ '^[A-Za-z0-9_-]{16,64}$'),
  project_id uuid not null,
  funnel_id uuid references public.funnels (id) on delete set null,
  screen_id text not null check (char_length(screen_id) between 1 and 100),
  plan_key text not null check (plan_key ~ '^[a-z0-9_-]{1,64}$'),
  amount int not null check (amount >= 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  reason text check (
    reason in (
      'amount_mismatch', 'currency_mismatch', 'plan_mismatch', 'project_mismatch',
      'funnel_missing', 'expired'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_ref)
);

create table public.payment_events (
  provider text not null check (provider in ('stripe', 'solidgate', 'mock')),
  event_id text not null check (char_length(event_id) between 1 and 255),
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);

create index payments_run_screen_idx on public.payments (run_id, screen_id);
create index payments_funnel_id_idx on public.payments (funnel_id);
create index payments_project_id_idx on public.payments (project_id);

alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

revoke all on public.payments, public.payment_events from anon, authenticated;
grant select on public.payments to authenticated;

create policy payments_select on public.payments
  for select to authenticated
  using (public.is_project_member(project_id));

create function public.record_payment_event(
  p_provider text,
  p_event_id text,
  p_provider_ref text,
  p_run_id text,
  p_project_id uuid,
  p_funnel_id uuid,
  p_screen_id text,
  p_plan_key text,
  p_amount int,
  p_currency text,
  p_status text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_events int;
begin
  insert into public.payment_events (provider, event_id)
  values (p_provider, p_event_id)
  on conflict (provider, event_id) do nothing;

  get diagnostics inserted_events = row_count;
  if inserted_events = 0 then
    return false;
  end if;

  insert into public.payments (
    provider, provider_ref, run_id, project_id, funnel_id, screen_id, plan_key, amount,
    currency, status, reason
  )
  values (
    p_provider, p_provider_ref, p_run_id, p_project_id, p_funnel_id, p_screen_id, p_plan_key,
    p_amount, p_currency, p_status, p_reason
  )
  on conflict (provider, provider_ref) do update
    set status = excluded.status,
        reason = excluded.reason,
        amount = excluded.amount,
        currency = excluded.currency,
        updated_at = now()
    where public.payments.status = 'pending'
      and excluded.status <> 'pending';

  return true;
end;
$$;

revoke execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text
) to service_role;

