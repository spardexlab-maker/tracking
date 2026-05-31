-- Performance pack for smoother dashboards and task lists.
-- Safe to run more than once.

create index if not exists tasks_workspace_created_active_idx
  on public.tasks (workspace_id, created_at desc)
  where archived_at is null;

create index if not exists tasks_workspace_assignee_active_idx
  on public.tasks (workspace_id, assignee_id, created_at desc)
  where archived_at is null;

create index if not exists tasks_workspace_project_active_idx
  on public.tasks (workspace_id, project_id, created_at desc)
  where archived_at is null;

create index if not exists tasks_workspace_completion_pending_idx
  on public.tasks (workspace_id, completion_requested_at)
  where archived_at is null
    and completion_requested_at is not null
    and completion_approved_at is null;

create index if not exists projects_workspace_created_active_idx
  on public.projects (workspace_id, created_at desc)
  where archived_at is null;

create index if not exists task_activities_workspace_created_idx
  on public.task_activities (workspace_id, created_at desc);

create or replace function public.get_dashboard_metrics(
  target_workspace_id uuid,
  today_date date default current_date
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'totalProjects',
      (
        select count(*)
        from public.projects p
        where p.workspace_id = target_workspace_id
          and p.archived_at is null
      ),
    'totalTasks',
      (
        select count(*)
        from public.tasks t
        where t.workspace_id = target_workspace_id
          and t.archived_at is null
      ),
    'completedTasks',
      (
        select count(*)
        from public.tasks t
        join public.task_statuses s on s.id = t.status_id
        where t.workspace_id = target_workspace_id
          and t.archived_at is null
          and s.is_done = true
      ),
    'overdueTasks',
      (
        select count(*)
        from public.tasks t
        join public.task_statuses s on s.id = t.status_id
        where t.workspace_id = target_workspace_id
          and t.archived_at is null
          and t.due_date < today_date
          and s.is_done = false
      ),
    'recentProjects',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', recent.id,
              'name', recent.name,
              'status', recent.status,
              'priority', recent.priority,
              'due_date', recent.due_date
            )
            order by recent.created_at desc
          )
          from (
            select id, name, status, priority, due_date, created_at
            from public.projects
            where workspace_id = target_workspace_id
              and archived_at is null
            order by created_at desc
            limit 5
          ) recent
        ),
        '[]'::jsonb
      ),
    'recentActivity',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', recent_activity.id,
              'activity_type', recent_activity.activity_type,
              'payload', recent_activity.payload,
              'created_at', recent_activity.created_at,
              'task', case
                when recent_activity.task_id is null then null
                else jsonb_build_object(
                  'id', recent_activity.task_id,
                  'title', recent_activity.task_title
                )
              end
            )
            order by recent_activity.created_at desc
          )
          from (
            select a.id, a.activity_type, a.payload, a.created_at, t.id as task_id, t.title as task_title
            from public.task_activities a
            left join public.tasks t on t.id = a.task_id
            where a.workspace_id = target_workspace_id
            order by a.created_at desc
            limit 8
          ) recent_activity
        ),
        '[]'::jsonb
      )
  );
$$;

