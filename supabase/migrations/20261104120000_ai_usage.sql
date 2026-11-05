create table public.ai_usage (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  feature text not null check (feature in ('brief', 'inline', 'images', 'chat')),
  provider text not null check (char_length(provider) between 1 and 40),
  model text not null check (char_length(model) between 1 and 120),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cached_input_tokens integer not null default 0 check (cached_input_tokens >= 0),
  images integer not null default 0 check (images >= 0),
  cost_micro_usd bigint not null default 0 check (cost_micro_usd >= 0),
  created_at timestamptz not null default now()
);

create index ai_usage_project_created_idx on public.ai_usage (project_id, created_at);

alter table public.ai_usage enable row level security;

revoke all on public.ai_usage from anon, authenticated;
grant select, insert on public.ai_usage to authenticated;

create policy ai_usage_select on public.ai_usage
  for select to authenticated
  using (public.is_project_member(project_id));

create policy ai_usage_insert on public.ai_usage
  for insert to authenticated
  with check (public.is_project_member(project_id) and user_id = auth.uid());

create function public.ai_spend_since(p_project_id uuid, p_since timestamptz)
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(cost_micro_usd), 0)::bigint
  from public.ai_usage
  where project_id = p_project_id and created_at >= p_since;
$$;

revoke all on function public.ai_spend_since(uuid, timestamptz) from public, anon;
grant execute on function public.ai_spend_since(uuid, timestamptz) to authenticated;

alter table public.funnels add column ai_draft_expires_at timestamptz;

create index funnels_ai_draft_expires_idx on public.funnels (ai_draft_expires_at)
  where ai_draft_expires_at is not null;

create table public.assets (
  id uuid primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  funnel_id uuid references public.funnels (id) on delete set null,
  user_id uuid not null default auth.uid(),
  path text not null unique check (char_length(path) between 1 and 300),
  width integer not null check (width between 1 and 10000),
  height integer not null check (height between 1 and 10000),
  bytes integer not null check (bytes between 1 and 20000000),
  source text not null check (source in ('ai', 'upload')),
  prompt text check (char_length(prompt) <= 2000),
  model text check (char_length(model) <= 120),
  created_at timestamptz not null default now()
);

create index assets_project_created_idx on public.assets (project_id, created_at desc);

alter table public.assets enable row level security;

revoke all on public.assets from anon, authenticated;
grant select, insert on public.assets to authenticated;

create policy assets_select on public.assets
  for select to authenticated
  using (public.is_project_member(project_id));

create policy assets_insert on public.assets
  for insert to authenticated
  with check (
    public.is_project_member(project_id)
    and user_id = auth.uid()
    and path like project_id::text || '/%'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('funnel-assets', 'funnel-assets', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create function public.asset_project_id(object_name text)
returns uuid
language sql
stable
set search_path = ''
as $$
  select case
    when (storage.foldername(object_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then ((storage.foldername(object_name))[1])::uuid
  end;
$$;

create policy funnel_assets_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'funnel-assets'
    and public.is_project_member(public.asset_project_id(name))
  );

create policy funnel_assets_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'funnel-assets'
    and owner_id = auth.uid()::text
    and public.is_project_member(public.asset_project_id(name))
  );
