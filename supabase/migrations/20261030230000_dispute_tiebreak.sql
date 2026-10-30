create or replace function public.apply_payment_adjustment_row(
  p_payment_id uuid,
  p_provider text,
  p_event_id text,
  p_amount_refunded int,
  p_dispute_status text,
  p_occurred_at timestamptz
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
  update public.payments p
  set amount_refunded = greatest(p.amount_refunded, coalesce(p_amount_refunded, 0)),
      dispute_status = case
        when p_dispute_status is not null
          and (
            p.dispute_event_at is null
            or p_occurred_at > p.dispute_event_at
            or (
              p_occurred_at = p.dispute_event_at
              and coalesce(p.dispute_status, '') not in ('won', 'lost', 'warning_closed', 'charge_refunded', 'prevented')
            )
          )
        then p_dispute_status
        else p.dispute_status
      end,
      dispute_event_at = case
        when p_dispute_status is not null
          and (p.dispute_event_at is null or p_occurred_at > p.dispute_event_at)
        then p_occurred_at
        else p.dispute_event_at
      end,
      updated_at = now()
  where p.id = p_payment_id;
  return true;
end;
$$;

revoke execute on function public.apply_payment_adjustment_row(uuid, text, text, int, text, timestamptz)
  from public, anon, authenticated;
