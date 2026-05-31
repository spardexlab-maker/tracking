create or replace function public.accept_workspace_invitation(invitation_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.workspace_invitations%rowtype;
  requester_email text;
begin
  requester_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select *
  into invitation
  from public.workspace_invitations
  where token_hash = encode(digest(convert_to(invitation_token, 'UTF8'), 'sha256'), 'hex')
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
$$;
