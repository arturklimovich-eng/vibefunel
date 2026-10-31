create table public.leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  funnel_id uuid references public.funnels (id) on delete set null,
  version_id uuid references public.funnel_versions (id) on delete set null,
  run_id text not null check (run_id ~ '^[A-Za-z0-9_-]{16,64}$'),
  screen_id text not null check (char_length(screen_id) between 1 and 100),
  block_id text not null check (char_length(block_id) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254 and email = lower(btrim(email))),
  consent boolean not null default false,
  consent_text text,
  created_at timestamptz not null default now(),
  check (consent = false or consent_text is not null),
  unique (funnel_id, run_id, email)
);

create index leads_funnel_created_idx on public.leads (funnel_id, created_at desc);
create index leads_project_id_idx on public.leads (project_id);
create index leads_version_id_idx on public.leads (version_id);

alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
grant select on public.leads to authenticated;

create policy leads_select on public.leads
  for select to authenticated
  using (public.is_project_member(project_id));

create function public.record_lead(
  p_funnel_id uuid,
  p_version int,
  p_run_id text,
  p_screen_id text,
  p_block_id text,
  p_email text,
  p_consent boolean,
  p_consent_text text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  f_project_id uuid;
  v_version_id uuid;
  inserted int;
begin
  select f.project_id into f_project_id
  from public.funnels f
  where f.id = p_funnel_id;

  if not found then
    raise exception 'funnel % does not exist', p_funnel_id
      using errcode = 'foreign_key_violation';
  end if;

  select v.id into v_version_id
  from public.funnel_versions v
  where v.funnel_id = p_funnel_id
    and v.version = p_version;

  insert into public.leads (
    project_id, funnel_id, version_id, run_id, screen_id, block_id, email, consent,
    consent_text
  )
  values (
    f_project_id, p_funnel_id, v_version_id, p_run_id, p_screen_id, p_block_id,
    lower(btrim(p_email)), coalesce(p_consent, false),
    case when coalesce(p_consent, false) then p_consent_text else null end
  )
  on conflict (funnel_id, run_id, email) do nothing;

  get diagnostics inserted = row_count;
  return inserted > 0;
end;
$$;

revoke execute on function public.record_lead(
  uuid, int, text, text, text, text, boolean, text
) from public, anon, authenticated;
grant execute on function public.record_lead(
  uuid, int, text, text, text, text, boolean, text
) to service_role;
