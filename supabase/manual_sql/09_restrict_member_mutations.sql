drop policy if exists "workspace contributors create tasks" on public.tasks;

create policy "workspace leaders create tasks"
on public.tasks for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
);

drop policy if exists "workspace leaders delete tasks" on public.tasks;

create policy "workspace leaders delete tasks"
on public.tasks for delete
to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
);

drop policy if exists "workspace contributors manage labels" on public.task_labels;

create policy "workspace leaders manage labels"
on public.task_labels for all
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

drop policy if exists "contributors manage label assignments" on public.task_label_assignments;

create policy "workspace leaders manage label assignments"
on public.task_label_assignments for all
to authenticated
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_id
      and public.has_workspace_role(
        t.workspace_id,
        array['owner', 'admin', 'manager']::public.workspace_role[]
      )
  )
)
with check (
  exists (
    select 1
    from public.tasks t
    where t.id = task_id
      and public.has_workspace_role(
        t.workspace_id,
        array['owner', 'admin', 'manager']::public.workspace_role[]
      )
  )
);

drop policy if exists "contributors manage checklist" on public.task_checklist_items;

create policy "workspace leaders manage checklist"
on public.task_checklist_items for all
to authenticated
using (
  public.can_access_task(task_id)
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
)
with check (
  public.can_access_task(task_id)
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'manager']::public.workspace_role[]
  )
);
