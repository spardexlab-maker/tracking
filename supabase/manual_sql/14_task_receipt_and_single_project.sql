-- Add tracking columns for task assignments and receipt
alter table public.tasks
  add column if not exists assigned_at timestamptz,
  add column if not exists received_at timestamptz;

-- Add index for fast querying on task metrics
create index if not exists tasks_assigned_received_idx 
  on public.tasks (workspace_id, assignee_id, assigned_at, received_at)
  where archived_at is null;

-- Trigger function to update task assignment timestamps automatically
create or replace function public.handle_task_assignment_receipt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.assignee_id is not null then
      new.assigned_at := now();
    end if;
  elsif tg_op = 'UPDATE' then
    if new.assignee_id is distinct from old.assignee_id then
      new.assigned_at := case when new.assignee_id is not null then now() else null end;
      new.received_at := null; -- Reset receipt status on new assignee assignment
    end if;
  end if;
  return new;
end;
$$;

-- Register trigger on tasks table
drop trigger if exists before_task_assign_receipt on public.tasks;
create trigger before_task_assign_receipt
  before insert or update of assignee_id on public.tasks
  for each row execute function public.handle_task_assignment_receipt();

-- Seed existing tasks
update public.tasks
  set assigned_at = created_at
  where assignee_id is not null and assigned_at is null;

update public.tasks
  set received_at = created_at
  where assignee_id is not null and received_at is null and status_id in (
    select id from public.task_statuses where is_done = true
  );
