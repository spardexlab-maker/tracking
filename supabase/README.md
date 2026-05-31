# Supabase setup

## 1. Create the project

Create a new Supabase project, then copy these values into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

`NEXT_PUBLIC_*` values are browser-visible. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client components.

## 2. Apply migrations

Run the SQL files in `supabase/migrations/` in lexical order using the Supabase SQL editor or CLI:

```bash
supabase db push
```

The initial migration creates:

- all core project-management tables
- row-level security policies
- auth profile bootstrap triggers
- task activity and assignment notification triggers
- the private `task-attachments` bucket
- storage policies
- realtime publication membership for tasks, comments, and notifications

## 3. Auth settings

In Supabase Auth:

1. Enable email/password sign-in.
2. Add the local and production app URLs to redirect URLs.
3. Keep email confirmation enabled for production unless your workflow explicitly requires otherwise.

## 4. Storage

The required bucket is:

- `task-attachments`

It is private. Object paths must follow:

```text
{workspace_id}/{task_id}/{uuid}-{filename}
```

The app stores metadata in `public.task_attachments`. Reads are guarded by RLS and signed URLs are generated server-side when files are opened.

## 5. RLS model

Every user-facing table has RLS enabled. The central rule is workspace membership:

- members can read their workspaces, projects, tasks, comments, and files
- contributors (`owner`, `admin`, `manager`, `member`) can create task content
- leaders (`owner`, `admin`, `manager`) can manage projects and statuses
- only `owner` and `admin` can manage workspace membership and invitations
- notifications and user settings are visible only to their owner

The UI may hide actions, but the database is the authority.
