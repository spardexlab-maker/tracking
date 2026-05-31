create or replace function public.notify_comment_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

drop trigger if exists after_comment_insert_notify_mentions on public.task_comments;
create trigger after_comment_insert_notify_mentions
  after insert on public.task_comments
  for each row execute function public.notify_comment_mentions();
