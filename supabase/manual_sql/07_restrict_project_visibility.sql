create or replace function public.can_access_project(
  target_project_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        public.has_workspace_role(
          p.workspace_id,
          array['owner', 'admin', 'manager']::public.workspace_role[],
          target_user_id
        )
        or exists (
          select 1
          from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = target_user_id
        )
      )
  )
$function$;

create or replace function public.can_access_task(
  target_task_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.tasks t
    where t.id = target_task_id
      and public.can_access_project(t.project_id, target_user_id)
  )
$function$;

drop policy if exists "projects visible to workspace members" on public.projects;

create policy "projects visible to leaders or project members"
on public.projects for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = public.projects.id
      and pm.user_id = auth.uid()
  )
);

drop policy if exists "tasks visible to workspace" on public.tasks;

create policy "tasks visible to leaders or project members"
on public.tasks for select
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = public.tasks.project_id
      and pm.user_id = auth.uid()
  )
);

drop policy if exists "project members visible to workspace" on public.project_members;

create policy "project members visible to leaders or project members"
on public.project_members for select
to authenticated
using (public.can_access_project(project_id));
