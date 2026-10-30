create table public.domains (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  funnel_id uuid not null references public.funnels (id) on delete cascade,
  hostname text not null check (
    char_length(hostname) <= 253
    and hostname ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
  ),
  status text not null default 'pending' check (status in ('pending', 'verified')),
  verification_token text not null
    default md5(gen_random_uuid()::text || clock_timestamp()::text)
    check (verification_token ~ '^[a-f0-9]{32}$'),
  verified_at timestamptz,
  last_checked_at timestamptz,
  last_error text check (char_length(last_error) <= 500),
  created_at timestamptz not null default now(),
  unique (funnel_id, hostname),
  check ((status = 'verified') = (verified_at is not null))
);

create unique index domains_verified_hostname_idx on public.domains (hostname)
  where status = 'verified';
create index domains_funnel_id_idx on public.domains (funnel_id);
create index domains_project_id_idx on public.domains (project_id);

create function public.domains_guard()
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

revoke execute on function public.domains_guard() from public, anon, authenticated;

create trigger domains_guard
  before insert or update on public.domains
  for each row execute function public.domains_guard();

create function public.record_domain_check(p_domain_id uuid, p_verified boolean, p_error text)
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
      last_error = left(p_error, 500)
  where d.id = p_domain_id
  returning d.* into updated;
  if not found then
    raise exception 'domain not found' using errcode = 'P0002';
  end if;
  return updated;
end;
$$;

revoke execute on function public.record_domain_check(uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function public.record_domain_check(uuid, boolean, text) to service_role;

create function public.get_published_funnel_by_host(p_host text)
returns table (funnel_id uuid, project_id uuid, slug text, version int, definition jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, f.project_id, f.slug, v.version, v.definition
  from public.domains d
  join public.funnels f on f.id = d.funnel_id
  join public.funnel_versions v on v.id = f.published_version_id
    and v.funnel_id = f.id
  where d.hostname = p_host
    and d.status = 'verified'
    and f.status = 'published';
$$;

revoke execute on function public.get_published_funnel_by_host(text)
  from public, anon, authenticated;
grant execute on function public.get_published_funnel_by_host(text) to anon, authenticated;

create function public.is_host_servable(p_host text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.domains d
    join public.funnels f on f.id = d.funnel_id
    where d.hostname = p_host
      and d.status = 'verified'
      and f.status = 'published'
      and f.published_version_id is not null
  );
$$;

revoke execute on function public.is_host_servable(text) from public, anon, authenticated;
grant execute on function public.is_host_servable(text) to anon, authenticated;

alter table public.domains enable row level security;

revoke all on public.domains from anon, authenticated;
grant select, insert, delete on public.domains to authenticated;

create policy domains_select on public.domains
  for select to authenticated
  using (public.is_project_member(project_id));

create policy domains_insert on public.domains
  for insert to authenticated
  with check (public.is_project_member(project_id));

create policy domains_delete on public.domains
  for delete to authenticated
  using (public.is_project_member(project_id));
