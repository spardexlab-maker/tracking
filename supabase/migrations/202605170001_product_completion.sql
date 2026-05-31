create or replace function public.accept_workspace_invitation(invitation_token text)
returns uuid
as $function$
declare
  invitation public.workspace_invitations%rowtype;
  requester_email text;
begin
  requester_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select *
  into invitation
  from public.workspace_invitations
  where token_hash = encode(digest(invitation_token, 'sha256'), 'hex')
    and accepted_at is null
    and expires_at > now()
  limit 1;

  if invitation.id is null then
    raise exception 'invalid_invitation';
  end if;

  if lower(invitation.email) <> requester_email then
    raise exception 'invitation_email_mismatch';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (invitation.workspace_id, auth.uid(), invitation.role)
  on conflict (workspace_id, user_id) do update
  set role = excluded.role,
      updated_at = now();

  update public.workspace_invitations
  set accepted_at = now(),
      updated_at = now()
  where id = invitation.id;

  update public.user_settings
  set active_workspace_id = invitation.workspace_id,
      updated_at = now()
  where user_id = auth.uid();

  return invitation.workspace_id;
end;
$function$
language plpgsql
security definer
set search_path = public;

revoke all on function public.accept_workspace_invitation(text) from public;
grant execute on function public.accept_workspace_invitation(text) to authenticated;

create or replace function public.add_project_creator_as_member()
returns trigger
as $function$
begin
  insert into public.project_members (project_id, user_id)
  values (new.id, new.created_by)
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$function$
language plpgsql
security definer
set search_path = public;

drop trigger if exists on_project_created_add_creator on public.projects;
create trigger on_project_created_add_creator
  after insert on public.projects
  for each row execute function public.add_project_creator_as_member();

create or replace function public.prevent_last_owner_removal()
returns trigger
as $function$
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
$function$
language plpgsql
security definer
set search_path = public;

drop trigger if exists before_workspace_member_role_update on public.workspace_members;
create trigger before_workspace_member_role_update
  before update of role on public.workspace_members
  for each row execute function public.prevent_last_owner_removal();

create or replace function public.notify_comment_mentions()
returns trigger
as $function$
begin
  insert into public.notifications (
    workspace_id,
    user_id,
    actor_id,
    task_id,
    type,
    title,
    body
  )
  select distinct
    new.workspace_id,
    p.id,
    new.author_id,
    new.task_id,
    'mentioned_in_comment',
    'Mentioned in comment',
    left(new.body, 180)
  from regexp_matches(
    new.body,
    '@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})',
    'g'
  ) as mention(email)
  join public.profiles p
    on lower(p.email) = lower(mention.email[1])
  join public.workspace_members wm
    on wm.user_id = p.id
   and wm.workspace_id = new.workspace_id
  where p.id <> new.author_id;

  return new;
end;
$function$
language plpgsql
security definer
set search_path = public;

drop trigger if exists after_comment_insert_notify_mentions on public.task_comments;
create trigger after_comment_insert_notify_mentions
  after insert on public.task_comments
  for each row execute function public.notify_comment_mentions();

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
