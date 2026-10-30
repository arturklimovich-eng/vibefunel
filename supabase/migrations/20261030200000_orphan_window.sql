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
  inserted_events int;
  seen timestamptz;
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
      and p.status = 'succeeded'
    order by p.updated_at desc
    limit 1
    for update;
  end if;

  if target_id is null then
    insert into public.payment_orphans (provider, event_id)
    values (p_provider, p_event_id)
    on conflict (provider, event_id) do nothing;
    select o.first_seen_at into seen
    from public.payment_orphans o
    where o.provider = p_provider and o.event_id = p_event_id;
    if seen < now() - interval '24 hours' or p_occurred_at < now() - interval '48 hours' then
      return 'orphaned';
    end if;
    return 'unmatched';
  end if;

  delete from public.payment_orphans o
  where o.provider = p_provider and o.event_id = p_event_id;

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
