create extension if not exists pgcrypto;

do $$ begin
  create type public.workspace_role as enum ('owner', 'admin', 'manager', 'member', 'viewer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_status as enum ('planned', 'active', 'on_hold', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.priority_level as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null default 'member',
  token_hash text not null unique,
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  description text,
  status public.project_status not null default 'active',
  priority public.priority_level not null default 'medium',
  start_date date,
  due_date date,
  archived_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  name_ar text not null,
  color text not null default '#64748b',
  position integer not null default 0,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  status_id uuid not null references public.task_statuses(id),
  task_number integer not null,
  title text not null check (char_length(title) between 2 and 220),
  description text,
  priority public.priority_level not null default 'medium',
  assignee_id uuid references public.profiles(id) on delete set null,
  start_date date,
  due_date date,
  archived_at timestamptz,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, task_number)
);

create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#0f766e',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.task_label_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.task_labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, label_id)
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  bucket_name text not null default 'task-attachments',
  object_path text not null unique,
  file_name text not null,
  mime_type text,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 220),
  is_done boolean not null default false,
  position integer not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_activities (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  task_id uuid references public.tasks(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  active_workspace_id uuid references public.workspaces(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_role_idx on public.workspace_members(workspace_id, role);
create index if not exists projects_workspace_idx on public.projects(workspace_id, archived_at);
create index if not exists project_members_user_idx on public.project_members(user_id);
create index if not exists task_statuses_workspace_position_idx on public.task_statuses(workspace_id, position);
create index if not exists tasks_workspace_idx on public.tasks(workspace_id, archived_at);
create index if not exists tasks_project_idx on public.tasks(project_id, archived_at);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id, archived_at);
create index if not exists tasks_status_idx on public.tasks(status_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists task_comments_task_idx on public.task_comments(task_id, created_at);
create index if not exists task_attachments_task_idx on public.task_attachments(task_id, created_at);
create index if not exists task_activities_task_idx on public.task_activities(task_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'workspaces',
    'workspace_members',
    'workspace_invitations',
    'projects',
    'task_statuses',
    'tasks',
    'task_labels',
    'task_comments',
    'task_checklist_items',
    'user_settings'
  ]
  loop
    execute format(
      'drop trigger if exists set_%I_updated_at on public.%I',
      table_name,
      table_name
    );
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.bootstrap_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  insert into public.task_statuses (workspace_id, name, name_ar, color, position, is_done)
  values
    (new.id, 'Pending', 'قيد الانتظار', '#64748b', 1, false),
    (new.id, 'In Progress', 'قيد التنفيذ', '#2563eb', 2, false),
    (new.id, 'Completed', 'مكتملة', '#16a34a', 3, true);

  update public.user_settings
  set active_workspace_id = new.id
  where user_id = new.created_by
    and active_workspace_id is null;

  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.bootstrap_workspace();

create or replace function public.assign_task_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.task_number is null or new.task_number = 0 then
    select coalesce(max(task_number), 0) + 1
    into new.task_number
    from public.tasks
    where project_id = new.project_id;
  end if;
  return new;
end;
$$;

drop trigger if exists before_task_insert_assign_number on public.tasks;
create trigger before_task_insert_assign_number
  before insert on public.tasks
  for each row execute function public.assign_task_number();

create or replace function public.log_task_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activities (task_id, workspace_id, actor_id, activity_type, payload)
  values (
    new.id,
    new.workspace_id,
    new.created_by,
    'task_created',
    jsonb_build_object('title', new.title, 'task_number', new.task_number)
  );
  return new;
end;
$$;

create or replace function public.log_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status_id is distinct from old.status_id then
    insert into public.task_activities (task_id, workspace_id, actor_id, activity_type, payload)
    values (
      new.id,
      new.workspace_id,
      coalesce(new.updated_by, new.created_by),
      'status_changed',
      jsonb_build_object('from', old.status_id, 'to', new.status_id)
    );
  end if;

  if new.assignee_id is distinct from old.assignee_id then
    insert into public.task_activities (task_id, workspace_id, actor_id, activity_type, payload)
    values (
      new.id,
      new.workspace_id,
      coalesce(new.updated_by, new.created_by),
      'assignee_changed',
      jsonb_build_object('from', old.assignee_id, 'to', new.assignee_id)
    );

    if new.assignee_id is not null then
      insert into public.notifications (
        workspace_id,
        user_id,
        actor_id,
        task_id,
        type,
        title,
        body
      )
      values (
        new.workspace_id,
        new.assignee_id,
        coalesce(new.updated_by, new.created_by),
        new.id,
        'task_assigned',
        'Task assigned',
        new.title
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.log_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activities (task_id, workspace_id, actor_id, activity_type, payload)
  values (
    new.task_id,
    new.workspace_id,
    new.author_id,
    'comment_added',
    jsonb_build_object('comment_id', new.id)
  );
  return new;
end;
$$;

create or replace function public.log_attachment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activities (task_id, workspace_id, actor_id, activity_type, payload)
  values (
    new.task_id,
    new.workspace_id,
    new.uploaded_by,
    'attachment_uploaded',
    jsonb_build_object('attachment_id', new.id, 'file_name', new.file_name)
  );
  return new;
end;
$$;

drop trigger if exists after_task_insert_log_activity on public.tasks;
create trigger after_task_insert_log_activity
  after insert on public.tasks
  for each row execute function public.log_task_insert();

drop trigger if exists after_task_update_log_activity on public.tasks;
create trigger after_task_update_log_activity
  after update on public.tasks
  for each row execute function public.log_task_update();

drop trigger if exists after_comment_insert_log_activity on public.task_comments;
create trigger after_comment_insert_log_activity
  after insert on public.task_comments
  for each row execute function public.log_comment_insert();

drop trigger if exists after_attachment_insert_log_activity on public.task_attachments;
create trigger after_attachment_insert_log_activity
  after insert on public.task_attachments
  for each row execute function public.log_attachment_insert();

create or replace function public.workspace_role_for(
  target_workspace_id uuid,
  target_user_id uuid default auth.uid()
)
returns public.workspace_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.workspace_members
  where workspace_id = target_workspace_id
    and user_id = target_user_id
  limit 1
$$;

create or replace function public.is_workspace_member(
  target_workspace_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = target_user_id
  )
$$;

create or replace function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles public.workspace_role[],
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.workspace_role_for(target_workspace_id, target_user_id) = any(allowed_roles), false)
$$;

create or replace function public.can_access_project(
  target_project_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and public.is_workspace_member(p.workspace_id, target_user_id)
  )
$$;

create or replace function public.can_access_task(
  target_task_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    where t.id = target_task_id
      and public.is_workspace_member(t.workspace_id, target_user_id)
  )
$$;

create or replace function public.safe_path_uuid(object_name text, path_index integer)
returns uuid
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  candidate text;
begin
  candidate := (storage.foldername(object_name))[path_index];
  return candidate::uuid;
exception
  when others then
    return null;
end;
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.task_statuses enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.task_label_assignments enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.task_activities enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

create policy "profiles visible to self and workspace peers"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs
      on theirs.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid()
      and theirs.user_id = public.profiles.id
  )
);

create policy "profiles update own row"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "workspaces visible to members"
on public.workspaces for select
to authenticated
using (public.is_workspace_member(id));

create policy "users create own workspaces"
on public.workspaces for insert
to authenticated
with check (created_by = auth.uid());

create policy "workspace leaders update workspace"
on public.workspaces for update
to authenticated
using (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]));

create policy "workspace members visible to workspace"
on public.workspace_members for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace leaders manage members"
on public.workspace_members for all
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "workspace invitations visible to leaders"
on public.workspace_invitations for select
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "workspace leaders manage invitations"
on public.workspace_invitations for all
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "projects visible to workspace members"
on public.projects for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace managers create projects"
on public.projects for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[])
);

create policy "workspace managers update projects"
on public.projects for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[]));

create policy "project members visible to workspace"
on public.project_members for select
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_workspace_member(p.workspace_id)
  )
);

create policy "workspace managers manage project members"
on public.project_members for all
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.has_workspace_role(p.workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[])
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.has_workspace_role(p.workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[])
  )
);

create policy "task statuses visible to workspace"
on public.task_statuses for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace managers manage statuses"
on public.task_statuses for all
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']::public.workspace_role[]));

create policy "tasks visible to workspace"
on public.tasks for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace contributors create tasks"
on public.tasks for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
);

create policy "workspace contributors update tasks"
on public.tasks for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[]));

create policy "labels visible to workspace"
on public.task_labels for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace contributors manage labels"
on public.task_labels for all
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[]));

create policy "label assignments visible to task viewers"
on public.task_label_assignments for select
to authenticated
using (public.can_access_task(task_id));

create policy "contributors manage label assignments"
on public.task_label_assignments for all
to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and public.has_workspace_role(t.workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
  )
)
with check (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and public.has_workspace_role(t.workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
  )
);

create policy "comments visible to task viewers"
on public.task_comments for select
to authenticated
using (public.can_access_task(task_id));

create policy "contributors add comments"
on public.task_comments for insert
to authenticated
with check (
  author_id = auth.uid()
  and public.can_access_task(task_id)
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
);

create policy "authors update own comments"
on public.task_comments for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "attachments visible to task viewers"
on public.task_attachments for select
to authenticated
using (public.can_access_task(task_id));

create policy "contributors add attachment metadata"
on public.task_attachments for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and public.can_access_task(task_id)
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
);

create policy "checklist visible to task viewers"
on public.task_checklist_items for select
to authenticated
using (public.can_access_task(task_id));

create policy "contributors manage checklist"
on public.task_checklist_items for all
to authenticated
using (
  public.can_access_task(task_id)
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
)
with check (
  public.can_access_task(task_id)
  and public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager', 'member']::public.workspace_role[])
);

create policy "activities visible to task viewers"
on public.task_activities for select
to authenticated
using (public.can_access_task(task_id));

create policy "users view own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy "users update own notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users view own settings"
on public.user_settings for select
to authenticated
using (user_id = auth.uid());

create policy "users update own settings"
on public.user_settings for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    active_workspace_id is null
    or public.is_workspace_member(active_workspace_id)
  )
);

insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

create policy "workspace users read task attachment objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'task-attachments'
  and public.is_workspace_member(public.safe_path_uuid(name, 1))
  and public.can_access_task(public.safe_path_uuid(name, 2))
);

create policy "contributors upload task attachment objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and public.is_workspace_member(public.safe_path_uuid(name, 1))
  and public.can_access_task(public.safe_path_uuid(name, 2))
  and public.has_workspace_role(
    public.safe_path_uuid(name, 1),
    array['owner', 'admin', 'manager', 'member']::public.workspace_role[]
  )
);

create policy "contributors remove own task attachment objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and public.is_workspace_member(public.safe_path_uuid(name, 1))
  and public.has_workspace_role(
    public.safe_path_uuid(name, 1),
    array['owner', 'admin', 'manager', 'member']::public.workspace_role[]
  )
);

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'tasks'
    ) then
      alter publication supabase_realtime add table public.tasks;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'task_comments'
    ) then
      alter publication supabase_realtime add table public.task_comments;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;
  end if;
end $$;
