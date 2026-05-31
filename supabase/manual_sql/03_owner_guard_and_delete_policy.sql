create or replace function public.prevent_last_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'owner'
     and new.role <> 'owner'
     and (
       select count(*)
       from public.workspace_members
       where workspace_id = old.workspace_id
         and role = 'owner'
     ) <= 1 then
    raise exception 'workspace_must_keep_owner';
  end if;

  return new;
end;
$$;

drop trigger if exists before_workspace_member_role_update on public.workspace_members;
create trigger before_workspace_member_role_update
  before update of role on public.workspace_members
  for each row execute function public.prevent_last_owner_removal();

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
