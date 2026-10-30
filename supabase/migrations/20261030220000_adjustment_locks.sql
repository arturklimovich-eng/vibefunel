delete from public.payment_orphans where occurred_at is null;

create or replace function public.apply_deferred_adjustments(p_payment_id uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  pay public.payments;
  orphan public.payment_orphans;
  applied int := 0;
begin
  select * into pay from public.payments where id = p_payment_id for update;
  if not found then
    return 0;
  end if;
  for orphan in
    select o.*
    from public.payment_orphans o
    where o.provider = pay.provider
      and (
        (pay.provider_payment_id is not null and o.provider_payment_id = pay.provider_payment_id)
        or (
          pay.status = 'succeeded'
          and pay.provider_payment_id is null
          and o.payer_hash is not null
          and o.payer_hash = pay.payer_hash
          and o.run_id = pay.run_id
          and o.screen_id = pay.screen_id
        )
      )
    order by o.occurred_at asc nulls first, o.first_seen_at asc
    for update
  loop
    if public.apply_payment_adjustment_row(
      pay.id, orphan.provider, orphan.event_id, orphan.amount_refunded,
      orphan.dispute_status, coalesce(orphan.occurred_at, orphan.first_seen_at)
    ) then
      applied := applied + 1;
    end if;
    delete from public.payment_orphans o
    where o.provider = orphan.provider and o.event_id = orphan.event_id;
  end loop;
  return applied;
end;
$$;

create or replace function public.record_payment_event(
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
  p_provider_payment_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_events int;
  payment_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_provider || ':' || p_run_id, 0));

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

  select p.id into payment_id
  from public.payments p
  where p.provider = p_provider and p.provider_ref = p_provider_ref;
  if payment_id is not null then
    perform public.apply_deferred_adjustments(payment_id);
  end if;

  return true;
end;
$$;

create or replace function public.record_payment_adjustment(
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
  deferred_rows int;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_provider || ':' || p_run_id, 0));

  if exists (
    select 1 from public.payment_events e
    where e.provider = p_provider and e.event_id = p_event_id
  ) then
    return 'duplicate';
  end if;
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
      and p.status = 'succeeded'
    order by p.updated_at desc
    limit 1
    for update;
  end if;

  if target_id is null then
    insert into public.payment_orphans (
      provider, event_id, provider_payment_id, run_id, screen_id, payer_hash,
      amount_refunded, dispute_status, occurred_at
    )
    values (
      p_provider, p_event_id, p_provider_payment_id, p_run_id, p_screen_id, p_payer_hash,
      p_amount_refunded, p_dispute_status, p_occurred_at
    )
    on conflict (provider, event_id) do nothing;
    get diagnostics deferred_rows = row_count;
    if deferred_rows = 0 then
      return 'duplicate';
    end if;
    return 'deferred';
  end if;

  delete from public.payment_orphans o
  where o.provider = p_provider and o.event_id = p_event_id;
  if public.apply_payment_adjustment_row(
    target_id, p_provider, p_event_id, p_amount_refunded, p_dispute_status, p_occurred_at
  ) then
    return 'recorded';
  end if;
  return 'duplicate';
end;
$$;
