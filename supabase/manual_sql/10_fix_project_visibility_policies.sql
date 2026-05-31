drop policy if exists "projects visible to leaders or project members" on public.projects;

create policy "projects visible to leaders or project members"
on public.projects for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = public.projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin', 'manager')
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = public.projects.id
      and pm.user_id = auth.uid()
  )
);

drop policy if exists "tasks visible to leaders or project members" on public.tasks;

create policy "tasks visible to leaders or project members"
on public.tasks for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = public.tasks.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin', 'manager')
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = public.tasks.project_id
      and pm.user_id = auth.uid()
  )
);

drop policy if exists "project members visible to leaders or project members" on public.project_members;

create policy "project members visible to leaders or project members"
on public.project_members for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    join public.workspace_members wm
      on wm.workspace_id = p.workspace_id
    where p.id = public.project_members.project_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin', 'manager')
  )
  or user_id = auth.uid()
);
