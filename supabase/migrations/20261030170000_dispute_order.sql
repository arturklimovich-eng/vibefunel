alter table public.payments add column dispute_event_at timestamptz;

drop function public.record_payment_adjustment(text, text, text, text, text, int, text);

create function public.record_payment_adjustment(
  p_provider text,
  p_event_id text,
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
  select p.id into target_id
  from public.payments p
  where p.provider = p_provider
    and p.run_id = p_run_id
    and p.screen_id = p_screen_id
    and p.payer_hash = p_payer_hash
    and p.status = 'succeeded'
  order by p.updated_at desc
  limit 1
  for update;
  if target_id is null then
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
  text, text, text, text, text, int, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.record_payment_adjustment(
  text, text, text, text, text, int, text, timestamptz
) to service_role;
