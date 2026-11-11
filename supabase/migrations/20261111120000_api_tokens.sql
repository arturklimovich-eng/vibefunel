create table public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  scopes text[] not null check (
    cardinality(scopes) between 1 and 4
    and scopes <@ array['read', 'write', 'publish', 'leads']::text[]
  ),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index api_tokens_user_idx on public.api_tokens (user_id, created_at desc);

alter table public.api_tokens enable row level security;

create policy api_tokens_select on public.api_tokens
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy api_tokens_update on public.api_tokens
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.api_tokens from anon, authenticated;
grant select (id, user_id, name, scopes, created_at, last_used_at, revoked_at)
  on public.api_tokens to authenticated;
grant update (revoked_at) on public.api_tokens to authenticated;

create function public.api_tokens_revoke_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.revoked_at is not null or new.revoked_at is null then
    raise exception 'api tokens can only be revoked once'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger api_tokens_revoke_only
  before update of revoked_at on public.api_tokens
  for each row
  when (current_user = 'authenticated')
  execute function public.api_tokens_revoke_only();

create function public.create_api_token(p_name text, p_hash text, p_scopes text[])
returns table (
  id uuid,
  name text,
  scopes text[],
  created_at timestamptz,
  last_used_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('api_tokens:' || v_user::text, 0));
  if (
    select count(*) from public.api_tokens t
    where t.user_id = v_user and t.revoked_at is null
  ) >= 20 then
    raise exception 'token limit reached' using errcode = 'program_limit_exceeded';
  end if;
  return query
    insert into public.api_tokens as t (user_id, name, token_hash, scopes)
    values (v_user, p_name, p_hash, p_scopes)
    returning t.id, t.name, t.scopes, t.created_at, t.last_used_at;
end;
$$;

revoke execute on function public.create_api_token(text, text, text[]) from public, anon;
grant execute on function public.create_api_token(text, text, text[]) to authenticated;

create function public.resolve_api_token(p_hash text)
returns table (token_id uuid, user_id uuid, scopes text[])
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    update public.api_tokens t
    set last_used_at = case
      when t.last_used_at is null or t.last_used_at < now() - interval '5 minutes' then now()
      else t.last_used_at
    end
    where t.token_hash = p_hash and t.revoked_at is null
    returning t.id, t.user_id, t.scopes;
end;
$$;

revoke execute on function public.resolve_api_token(text) from public;
grant execute on function public.resolve_api_token(text) to anon, authenticated;
