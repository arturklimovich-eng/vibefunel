alter table public.payments
  add column payer_hash text check (payer_hash ~ '^[a-f0-9]{64}$');

create index payments_run_screen_payer_idx on public.payments (run_id, screen_id, payer_hash);

drop function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text
);

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
  p_reason text,
  p_payer_hash text
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
    currency, status, reason, payer_hash
  )
  values (
    p_provider, p_provider_ref, p_run_id, p_project_id, p_funnel_id, p_screen_id, p_plan_key,
    p_amount, p_currency, p_status, p_reason, p_payer_hash
  )
  on conflict (provider, provider_ref) do update
    set status = excluded.status,
        reason = excluded.reason,
        amount = excluded.amount,
        currency = excluded.currency,
        payer_hash = coalesce(public.payments.payer_hash, excluded.payer_hash),
        updated_at = now()
    where public.payments.status = 'pending'
      and excluded.status <> 'pending';

  return true;
end;
$$;

revoke execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text, text
) to service_role;
