alter table public.domains
  add column recheck_failures int not null default 0 check (recheck_failures >= 0);

create or replace function public.domains_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_project uuid;
  existing int;
begin
  if tg_op = 'INSERT' then
    select f.project_id into owner_project
    from public.funnels f
    where f.id = new.funnel_id
    for update;
    if owner_project is null or owner_project <> new.project_id then
      raise exception 'domain project does not match the funnel project' using errcode = '23503';
    end if;
    select count(*) into existing from public.domains d where d.funnel_id = new.funnel_id;
    if existing >= 5 then
      raise exception 'at most 5 domains per funnel' using errcode = '54000';
    end if;
    new.status := 'pending';
    new.verified_at := null;
    new.last_checked_at := null;
    new.last_error := null;
    new.recheck_failures := 0;
    new.verification_token := md5(gen_random_uuid()::text || clock_timestamp()::text);
    return new;
  end if;
  if new.funnel_id <> old.funnel_id
     or new.project_id <> old.project_id
     or new.hostname <> old.hostname
     or new.verification_token <> old.verification_token
     or new.created_at <> old.created_at then
    raise exception 'domain identity is immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.record_domain_check(p_domain_id uuid, p_verified boolean, p_error text)
returns public.domains
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated public.domains;
begin
  update public.domains d
  set status = case when p_verified then 'verified' else 'pending' end,
      verified_at = case when p_verified then coalesce(d.verified_at, now()) else null end,
      last_checked_at = now(),
      last_error = left(p_error, 500),
      recheck_failures = 0
  where d.id = p_domain_id
  returning d.* into updated;
  if not found then
    raise exception 'domain not found' using errcode = 'P0002';
  end if;
  return updated;
end;
$$;

create function public.claim_domain_rechecks(p_cutoff timestamptz, p_limit int)
returns setof public.domains
language sql
security definer
set search_path = ''
as $$
  update public.domains d
  set last_checked_at = now()
  where d.id in (
    select c.id
    from public.domains c
    where (c.status = 'verified' or (c.status = 'pending' and c.recheck_failures between 1 and 29))
      and (c.last_checked_at is null or c.last_checked_at < p_cutoff)
    order by c.last_checked_at asc nulls first
    limit least(greatest(p_limit, 0), 200)
    for update skip locked
  )
  returning d.*;
$$;

revoke execute on function public.claim_domain_rechecks(timestamptz, int)
  from public, anon, authenticated;
grant execute on function public.claim_domain_rechecks(timestamptz, int) to service_role;

create function public.record_domain_recheck(
  p_domain_id uuid,
  p_outcome text,
  p_error text,
  p_revoke_after int
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.domains;
begin
  if p_outcome not in ('ok', 'missing', 'unknown') then
    raise exception 'invalid outcome' using errcode = '22023';
  end if;
  select * into target
  from public.domains d
  where d.id = p_domain_id
    and (d.status = 'verified' or (d.status = 'pending' and d.recheck_failures > 0))
  for update;
  if not found then
    return 'skipped';
  end if;

  if p_outcome = 'unknown' then
    update public.domains set last_error = left(p_error, 500) where id = target.id;
    return 'unknown';
  end if;

  if p_outcome = 'ok' then
    if target.status = 'verified' then
      update public.domains set recheck_failures = 0, last_error = null where id = target.id;
      return 'kept';
    end if;
    begin
      update public.domains
      set status = 'verified', verified_at = now(), recheck_failures = 0, last_error = null
      where id = target.id;
    exception when unique_violation then
      update public.domains
      set recheck_failures = 0,
          last_error = 'The TXT record is back, but another funnel has verified this hostname.'
      where id = target.id;
      return 'taken';
    end;
    return 'restored';
  end if;

  if target.status = 'pending' then
    update public.domains
    set recheck_failures = least(target.recheck_failures + 1, 1000), last_error = left(p_error, 500)
    where id = target.id;
    return 'still_missing';
  end if;
  if target.recheck_failures + 1 >= greatest(p_revoke_after, 1) then
    update public.domains
    set status = 'pending', verified_at = null, recheck_failures = target.recheck_failures + 1,
        last_error = left(p_error, 500)
    where id = target.id;
    return 'revoked';
  end if;
  update public.domains
  set recheck_failures = target.recheck_failures + 1, last_error = left(p_error, 500)
  where id = target.id;
  return 'warned';
end;
$$;

revoke execute on function public.record_domain_recheck(uuid, text, text, int)
  from public, anon, authenticated;
grant execute on function public.record_domain_recheck(uuid, text, text, int) to service_role;
