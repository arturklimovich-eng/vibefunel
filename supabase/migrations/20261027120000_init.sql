create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  created_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor')),
  primary key (project_id, user_id)
);

create table public.funnels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  name text not null check (char_length(name) between 1 and 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  draft_definition jsonb not null,
  draft_schema_version int not null,
  draft_revision int not null default 1,
  published_version_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.funnel_versions (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels (id) on delete cascade,
  version int not null check (version > 0),
  schema_version int not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  unique (funnel_id, version)
);

alter table public.funnels
  add constraint funnels_published_version_id_fkey
  foreign key (published_version_id) references public.funnel_versions (id);

create index funnels_project_id_idx on public.funnels (project_id);
create index funnel_versions_funnel_id_idx on public.funnel_versions (funnel_id);
create index project_members_user_id_idx on public.project_members (user_id);

create function public.is_project_member(p uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.project_members m
    where m.project_id = p
      and m.user_id = (select auth.uid())
  );
$$;

create function public.is_project_owner(p uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.project_members m
    where m.project_id = p
      and m.user_id = (select auth.uid())
      and m.role = 'owner'
  );
$$;

revoke execute on function public.is_project_member(uuid) from public, anon, authenticated;
revoke execute on function public.is_project_owner(uuid) from public, anon, authenticated;
grant execute on function public.is_project_member(uuid) to authenticated;
grant execute on function public.is_project_owner(uuid) to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_project_id uuid;
begin
  insert into public.projects (name)
  values ('My project')
  returning id into new_project_id;

  insert into public.project_members (project_id, user_id, role)
  values (new_project_id, new.id, 'owner');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.funnel_versions_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;
  raise exception 'funnel_versions rows are immutable'
    using errcode = 'restrict_violation';
end;
$$;

revoke execute on function public.funnel_versions_immutable() from public, anon, authenticated;

create trigger funnel_versions_no_update
  before update on public.funnel_versions
  for each row execute function public.funnel_versions_immutable();

create trigger funnel_versions_no_delete
  before delete on public.funnel_versions
  for each row execute function public.funnel_versions_immutable();

create function public.funnels_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if not public.funnel_definition_is_valid(new.draft_definition, new.draft_schema_version) then
      raise exception 'invalid_definition' using errcode = '22023';
    end if;
    new.status = 'draft';
    new.published_version_id = null;
    new.draft_revision = 1;
    new.updated_at = now();
    return new;
  end if;
  if current_setting('app.rpc', true) is distinct from 'on' then
    if (
      new.id, new.project_id, new.slug, new.status, new.draft_definition,
      new.draft_schema_version, new.draft_revision, new.published_version_id, new.created_at
    ) is distinct from (
      old.id, old.project_id, old.slug, old.status, old.draft_definition,
      old.draft_schema_version, old.draft_revision, old.published_version_id, old.created_at
    ) then
      raise exception 'only name can be updated directly' using errcode = '42501';
    end if;
  end if;
  new.updated_at = now();
  if new.published_version_id is not null
    and not exists (
      select 1
      from public.funnel_versions v
      where v.id = new.published_version_id
        and v.funnel_id = new.id
    ) then
    raise exception 'published_version_id must reference a version of this funnel'
      using errcode = 'foreign_key_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.funnels_guard() from public, anon, authenticated;

create trigger funnels_guard_write
  before insert or update on public.funnels
  for each row execute function public.funnels_guard();

create function public.project_members_keep_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;
  perform 1 from public.projects p where p.id = old.project_id for update;
  if old.role = 'owner'
    and (tg_op = 'DELETE' or new.role <> 'owner')
    and not exists (
      select 1
      from public.project_members m
      where m.project_id = old.project_id
        and m.role = 'owner'
        and m.user_id <> old.user_id
    ) then
    raise exception 'last_owner' using errcode = 'restrict_violation';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke execute on function public.project_members_keep_owner() from public, anon, authenticated;

create trigger project_members_keep_owner
  before update or delete on public.project_members
  for each row execute function public.project_members_keep_owner();

create function public.project_members_fixed_keys()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id <> old.user_id or new.project_id <> old.project_id then
    raise exception 'membership keys are immutable' using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.project_members_fixed_keys() from public, anon, authenticated;

create trigger project_members_fixed_keys
  before update on public.project_members
  for each row execute function public.project_members_fixed_keys();

create function public.funnel_definition_is_valid(d jsonb, v int)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(d) = 'object'
      and jsonb_typeof(d -> 'screens') = 'array'
      and jsonb_typeof(d -> 'edges') = 'array'
      and jsonb_typeof(d -> 'startScreenId') = 'string'
      and jsonb_typeof(d -> 'schemaVersion') = 'number'
      and (d ->> 'schemaVersion') ~ '^[0-9]+$'
    then (d ->> 'schemaVersion')::int = v
    else false
  end;
$$;

revoke execute on function public.funnel_definition_is_valid(jsonb, int) from public, anon, authenticated;

create function public.save_draft(
  p_funnel_id uuid,
  p_expected_revision int,
  p_definition jsonb,
  p_schema_version int
)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.funnels;
  new_revision int;
begin
  perform set_config('app.rpc', 'on', true);

  select * into f
  from public.funnels
  where id = p_funnel_id
  for update;

  if not found or not public.is_project_member(f.project_id) then
    raise exception 'funnel_not_found' using errcode = 'P0002';
  end if;

  if f.draft_revision <> p_expected_revision then
    raise exception 'revision_conflict' using errcode = '40001';
  end if;

  if not public.funnel_definition_is_valid(p_definition, p_schema_version) then
    raise exception 'invalid_definition' using errcode = '22023';
  end if;

  update public.funnels
  set draft_definition = p_definition,
      draft_schema_version = p_schema_version,
      draft_revision = f.draft_revision + 1
  where id = f.id
  returning draft_revision into new_revision;

  return new_revision;
end;
$$;

revoke execute on function public.save_draft(uuid, int, jsonb, int) from public, anon, authenticated;
grant execute on function public.save_draft(uuid, int, jsonb, int) to authenticated;

create function public.publish_funnel(p_funnel_id uuid, p_expected_revision int)
returns public.funnel_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.funnels;
  next_version int;
  created public.funnel_versions;
begin
  perform set_config('app.rpc', 'on', true);

  select * into f
  from public.funnels
  where id = p_funnel_id
  for update;

  if not found or not public.is_project_member(f.project_id) then
    raise exception 'funnel_not_found' using errcode = 'P0002';
  end if;

  if f.draft_revision <> p_expected_revision then
    raise exception 'revision_conflict' using errcode = '40001';
  end if;

  if not public.funnel_definition_is_valid(f.draft_definition, f.draft_schema_version) then
    raise exception 'invalid_definition' using errcode = '22023';
  end if;

  select coalesce(max(v.version), 0) + 1
  into next_version
  from public.funnel_versions v
  where v.funnel_id = f.id;

  insert into public.funnel_versions (funnel_id, version, schema_version, definition)
  values (f.id, next_version, f.draft_schema_version, f.draft_definition)
  returning * into created;

  update public.funnels
  set status = 'published', published_version_id = created.id
  where id = f.id;

  return created;
end;
$$;

revoke execute on function public.publish_funnel(uuid, int) from public, anon, authenticated;
grant execute on function public.publish_funnel(uuid, int) to authenticated;

create function public.rollback_funnel(p_funnel_id uuid, p_version_id uuid)
returns public.funnels
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.funnels;
begin
  perform set_config('app.rpc', 'on', true);

  select * into f
  from public.funnels
  where id = p_funnel_id
  for update;

  if not found or not public.is_project_member(f.project_id) then
    raise exception 'funnel_not_found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.funnel_versions v
    where v.id = p_version_id
      and v.funnel_id = f.id
  ) then
    raise exception 'version_not_found' using errcode = '23503';
  end if;

  update public.funnels
  set status = 'published', published_version_id = p_version_id
  where id = f.id
  returning * into f;

  return f;
end;
$$;

revoke execute on function public.rollback_funnel(uuid, uuid) from public, anon, authenticated;
grant execute on function public.rollback_funnel(uuid, uuid) to authenticated;

create function public.get_published_funnel(p_slug text)
returns table (funnel_id uuid, project_id uuid, version int, definition jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, f.project_id, v.version, v.definition
  from public.funnels f
  join public.funnel_versions v on v.id = f.published_version_id
    and v.funnel_id = f.id
  where f.slug = p_slug
    and f.status = 'published';
$$;

revoke execute on function public.get_published_funnel(text) from public, anon, authenticated;
grant execute on function public.get_published_funnel(text) to anon, authenticated;

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.funnels enable row level security;
alter table public.funnel_versions enable row level security;

revoke all on public.projects, public.project_members, public.funnels, public.funnel_versions from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated, anon;

create policy projects_select on public.projects
  for select to authenticated
  using (public.is_project_member(id));

create policy projects_update on public.projects
  for update to authenticated
  using (public.is_project_owner(id))
  with check (public.is_project_owner(id));

create policy projects_delete on public.projects
  for delete to authenticated
  using (public.is_project_owner(id));

create policy project_members_select on public.project_members
  for select to authenticated
  using (public.is_project_member(project_id));

create policy project_members_insert on public.project_members
  for insert to authenticated
  with check (public.is_project_owner(project_id));

create policy project_members_update on public.project_members
  for update to authenticated
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy project_members_delete on public.project_members
  for delete to authenticated
  using (public.is_project_owner(project_id));

create policy funnels_select on public.funnels
  for select to authenticated
  using (public.is_project_member(project_id));

create policy funnels_insert on public.funnels
  for insert to authenticated
  with check (public.is_project_member(project_id));

create policy funnels_update on public.funnels
  for update to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

create policy funnels_delete on public.funnels
  for delete to authenticated
  using (public.is_project_owner(project_id));

create policy funnel_versions_select on public.funnel_versions
  for select to authenticated
  using (exists (
    select 1
    from public.funnels f
    where f.id = funnel_versions.funnel_id
      and public.is_project_member(f.project_id)
  ));

do $$
declare
  u record;
  pid uuid;
begin
  for u in
    select x.id
    from auth.users x
    where not exists (
      select 1 from public.project_members m where m.user_id = x.id
    )
  loop
    insert into public.projects (name) values ('My project') returning id into pid;
    insert into public.project_members (project_id, user_id, role) values (pid, u.id, 'owner');
  end loop;
end;
$$;
