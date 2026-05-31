drop policy if exists "workspace contributors update tasks" on public.tasks;

create policy "workspace leaders update tasks"
on public.tasks for update
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
)
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
);

create or replace function public.update_assigned_task_progress(
  target_task_id uuid,
  target_status_id uuid,
  note_body text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  target_task public.tasks%rowtype;
begin
  select *
  into target_task
  from public.tasks
  where id = target_task_id
    and archived_at is null;

  if not found then
    raise exception 'task_not_found';
  end if;

  if not (
    target_task.assignee_id = auth.uid()
    or public.has_workspace_role(
      target_task.workspace_id,
      array['owner', 'admin', 'manager']::public.workspace_role[]
    )
  ) then
    raise exception 'task_progress_forbidden';
  end if;

  if not exists (
    select 1
    from public.task_statuses
    where id = target_status_id
      and workspace_id = target_task.workspace_id
  ) then
    raise exception 'invalid_task_status';
  end if;

  update public.tasks
  set status_id = target_status_id,
      updated_by = auth.uid()
  where id = target_task_id;

  if nullif(trim(coalesce(note_body, '')), '') is not null then
    insert into public.task_comments (
      task_id,
      workspace_id,
      author_id,
      body
    )
    values (
      target_task_id,
      target_task.workspace_id,
      auth.uid(),
      trim(note_body)
    );
  end if;
end;
$function$;

grant execute on function public.update_assigned_task_progress(uuid, uuid, text)
to authenticated;
