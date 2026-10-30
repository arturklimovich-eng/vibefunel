alter table public.payments
  add column amount_refunded int not null default 0 check (amount_refunded >= 0),
  add column dispute_status text check (
    dispute_status is null or dispute_status ~ '^[a-z_]{1,40}$'
  );

create function public.record_payment_adjustment(
  p_provider text,
  p_event_id text,
  p_run_id text,
  p_screen_id text,
  p_payer_hash text,
  p_amount_refunded int,
  p_dispute_status text
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

  update public.payments
  set amount_refunded = greatest(amount_refunded, coalesce(p_amount_refunded, 0)),
      dispute_status = coalesce(p_dispute_status, dispute_status),
      updated_at = now()
  where id = target_id;
  return 'recorded';
end;
$$;

revoke execute on function public.record_payment_adjustment(text, text, text, text, text, int, text)
  from public, anon, authenticated;
grant execute on function public.record_payment_adjustment(text, text, text, text, text, int, text)
  to service_role;
