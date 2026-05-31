alter table public.tasks
  add column if not exists completion_requested_at timestamptz,
  add column if not exists completion_requested_by uuid references public.profiles(id) on delete set null,
  add column if not exists completion_requested_status_id uuid references public.task_statuses(id) on delete set null,
  add column if not exists completion_approved_at timestamptz,
  add column if not exists completion_approved_by uuid references public.profiles(id) on delete set null;

create index if not exists tasks_completion_pending_idx
  on public.tasks (workspace_id, completion_requested_at)
  where completion_requested_at is not null
    and completion_approved_at is null;

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
  target_status public.task_statuses%rowtype;
  caller_is_leader boolean;
begin
  select *
  into target_task
  from public.tasks
  where id = target_task_id
    and archived_at is null;

  if not found then
    raise exception 'task_not_found';
  end if;

  caller_is_leader := public.has_workspace_role(
    target_task.workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  );

  if not (
    target_task.assignee_id = auth.uid()
    or caller_is_leader
  ) then
    raise exception 'task_progress_forbidden';
  end if;

  select *
  into target_status
  from public.task_statuses
  where id = target_status_id
    and workspace_id = target_task.workspace_id;

  if not found then
    raise exception 'invalid_task_status';
  end if;

  if target_status.is_done and not caller_is_leader then
    update public.tasks
    set completion_requested_at = now(),
        completion_requested_by = auth.uid(),
        completion_requested_status_id = target_status_id,
        completion_approved_at = null,
        completion_approved_by = null,
        updated_by = auth.uid()
    where id = target_task_id;
  else
    update public.tasks
    set status_id = target_status_id,
        completion_requested_at = null,
        completion_requested_by = null,
        completion_requested_status_id = null,
        completion_approved_at = case when target_status.is_done then now() else null end,
        completion_approved_by = case when target_status.is_done then auth.uid() else null end,
        updated_by = auth.uid()
    where id = target_task_id;
  end if;

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

create or replace function public.approve_task_completion(
  target_task_id uuid
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
    and completion_requested_at is not null
    and completion_approved_at is null;

  if not found then
    raise exception 'completion_request_not_found';
  end if;

  if not public.has_workspace_role(
    target_task.workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  ) then
    raise exception 'completion_approval_forbidden';
  end if;

  update public.tasks
  set status_id = completion_requested_status_id,
      completion_approved_at = now(),
      completion_approved_by = auth.uid(),
      updated_by = auth.uid()
  where id = target_task_id;
end;
$function$;

grant execute on function public.update_assigned_task_progress(uuid, uuid, text)
to authenticated;

grant execute on function public.approve_task_completion(uuid)
to authenticated;
