create or replace function public.get_my_active_workspace_context()
returns table (
  workspace_id uuid,
  workspace_name text,
  member_role public.workspace_role
)
language sql
stable
security definer
set search_path = public
as $function$
  with selected_workspace as (
    select coalesce(
      (
        select us.active_workspace_id
        from public.user_settings us
        where us.user_id = auth.uid()
      ),
      (
        select wm.workspace_id
        from public.workspace_members wm
        where wm.user_id = auth.uid()
        order by wm.created_at asc
        limit 1
      )
    ) as workspace_id
  )
  select
    w.id as workspace_id,
    w.name as workspace_name,
    wm.role as member_role
  from selected_workspace sw
  join public.workspaces w
    on w.id = sw.workspace_id
  join public.workspace_members wm
    on wm.workspace_id = w.id
   and wm.user_id = auth.uid()
  limit 1
$function$;

grant execute on function public.get_my_active_workspace_context()
to authenticated;
