create or replace function public.can_view_project_row(
  target_project_id uuid,
  target_workspace_id uuid,
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
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = target_user_id
      and wm.role in ('owner', 'admin', 'manager')
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = target_user_id
  )
$function$;

create or replace function public.can_view_project_member_row(
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
    join public.workspace_members wm
      on wm.workspace_id = p.workspace_id
    where p.id = target_project_id
      and wm.user_id = target_user_id
      and wm.role in ('owner', 'admin', 'manager')
  )
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = target_user_id
  )
$function$;

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
      and public.can_view_project_row(
        p.id,
        p.workspace_id,
        target_user_id
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
      and public.can_view_project_row(
        t.project_id,
        t.workspace_id,
        target_user_id
      )
  )
$function$;

drop policy if exists "projects visible to leaders or project members" on public.projects;

create policy "projects visible to leaders or project members"
on public.projects for select
to authenticated
using (
  public.can_view_project_row(id, workspace_id)
);

drop policy if exists "tasks visible to leaders or project members" on public.tasks;

create policy "tasks visible to leaders or project members"
on public.tasks for select
to authenticated
using (
  public.can_view_project_row(project_id, workspace_id)
);

drop policy if exists "project members visible to leaders or project members" on public.project_members;

create policy "project members visible to leaders or project members"
on public.project_members for select
to authenticated
using (
  public.can_view_project_member_row(project_id)
);
