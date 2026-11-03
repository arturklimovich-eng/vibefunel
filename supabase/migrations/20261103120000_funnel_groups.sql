create table public.funnel_groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (id, project_id)
);

create index funnel_groups_project_id_idx on public.funnel_groups (project_id);

alter table public.funnels add column group_id uuid null;

alter table public.funnels
  add constraint funnels_group_fkey
  foreign key (group_id, project_id) references public.funnel_groups (id, project_id)
  on delete set null (group_id);

create index funnels_group_id_idx on public.funnels (group_id);

alter table public.funnel_groups enable row level security;

revoke all on public.funnel_groups from anon, authenticated;
grant select, insert, delete on public.funnel_groups to authenticated;
grant update (name) on public.funnel_groups to authenticated;

create policy funnel_groups_select on public.funnel_groups
  for select to authenticated
  using (public.is_project_member(project_id));

create policy funnel_groups_insert on public.funnel_groups
  for insert to authenticated
  with check (public.is_project_member(project_id));

create policy funnel_groups_update on public.funnel_groups
  for update to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

create policy funnel_groups_delete on public.funnel_groups
  for delete to authenticated
  using (public.is_project_member(project_id));
