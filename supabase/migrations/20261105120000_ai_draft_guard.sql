create or replace function public.funnels_guard()
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
  if new.ai_draft_expires_at is not null
    and new.ai_draft_expires_at is distinct from old.ai_draft_expires_at then
    raise exception 'ai_draft_expires_at can only be cleared' using errcode = '42501';
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

create policy funnel_assets_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'funnel-assets'
    and public.is_project_member(public.asset_project_id(name))
  );
