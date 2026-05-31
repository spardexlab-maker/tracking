create or replace function public.add_project_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id)
  values (new.id, new.created_by)
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_project_created_add_creator on public.projects;
create trigger on_project_created_add_creator
  after insert on public.projects
  for each row execute function public.add_project_creator_as_member();
