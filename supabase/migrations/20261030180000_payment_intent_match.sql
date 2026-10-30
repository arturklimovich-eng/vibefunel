alter table public.payments
  add column provider_payment_id text check (char_length(provider_payment_id) between 1 and 255);

create index payments_provider_payment_idx on public.payments (provider, provider_payment_id);

drop function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text, text
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
  p_payer_hash text,
  p_provider_payment_id text
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
    currency, status, reason, payer_hash, provider_payment_id
  )
  values (
    p_provider, p_provider_ref, p_run_id, p_project_id, p_funnel_id, p_screen_id, p_plan_key,
    p_amount, p_currency, p_status, p_reason, p_payer_hash, p_provider_payment_id
  )
  on conflict (provider, provider_ref) do update
    set status = case
          when public.payments.status = 'pending' and excluded.status <> 'pending'
          then excluded.status
          else public.payments.status
        end,
        reason = case
          when public.payments.status = 'pending' and excluded.status <> 'pending'
          then excluded.reason
          else public.payments.reason
        end,
        amount = case
          when public.payments.status = 'pending' and excluded.status <> 'pending'
          then excluded.amount
          else public.payments.amount
        end,
        currency = case
          when public.payments.status = 'pending' and excluded.status <> 'pending'
          then excluded.currency
          else public.payments.currency
        end,
        payer_hash = coalesce(public.payments.payer_hash, excluded.payer_hash),
        provider_payment_id = coalesce(
          public.payments.provider_payment_id,
          excluded.provider_payment_id
        ),
        updated_at = now()
    where (public.payments.status = 'pending' and excluded.status <> 'pending')
      or (public.payments.provider_payment_id is null and excluded.provider_payment_id is not null);

  return true;
end;
$$;

revoke execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_payment_event(
  text, text, text, text, uuid, uuid, text, text, int, text, text, text, text, text
) to service_role;

drop function public.record_payment_adjustment(text, text, text, text, text, int, text, timestamptz);

create function public.record_payment_adjustment(
  p_provider text,
  p_event_id text,
  p_provider_payment_id text,
  p_run_id text,
  p_screen_id text,
  p_payer_hash text,
  p_amount_refunded int,
  p_dispute_status text,
  p_occurred_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  inserted_events int;
begin
  if p_provider_payment_id is not null then
    select p.id into target_id
    from public.payments p
    where p.provider = p_provider
      and p.provider_payment_id = p_provider_payment_id
    order by p.updated_at desc
    limit 1
    for update;
  end if;
  if target_id is null and p_payer_hash is not null then
    select p.id into target_id
    from public.payments p
    where p.provider = p_provider
      and p.run_id = p_run_id
      and p.screen_id = p_screen_id
      and p.payer_hash = p_payer_hash
      and p.provider_payment_id is null
    order by (p.status = 'succeeded') desc, p.updated_at desc
    limit 1
    for update;
  end if;

  if target_id is null then
    if p_occurred_at < now() - interval '1 hour' then
      insert into public.payment_events (provider, event_id)
      values (p_provider, p_event_id)
      on conflict (provider, event_id) do nothing;
      return 'orphaned';
    end if;
    return 'unmatched';
  end if;

  insert into public.payment_events (provider, event_id)
  values (p_provider, p_event_id)
  on conflict (provider, event_id) do nothing;
  get diagnostics inserted_events = row_count;
  if inserted_events = 0 then
    return 'duplicate';
  end if;

  update public.payments p
  set amount_refunded = greatest(p.amount_refunded, coalesce(p_amount_refunded, 0)),
      dispute_status = case
        when p_dispute_status is not null
          and (p.dispute_event_at is null or p_occurred_at >= p.dispute_event_at)
        then p_dispute_status
        else p.dispute_status
      end,
      dispute_event_at = case
        when p_dispute_status is not null
          and (p.dispute_event_at is null or p_occurred_at >= p.dispute_event_at)
        then p_occurred_at
        else p.dispute_event_at
      end,
      updated_at = now()
  where p.id = target_id;
  return 'recorded';
end;
$$;

revoke execute on function public.record_payment_adjustment(
  text, text, text, text, text, text, int, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.record_payment_adjustment(
  text, text, text, text, text, text, int, text, timestamptz
) to service_role;
