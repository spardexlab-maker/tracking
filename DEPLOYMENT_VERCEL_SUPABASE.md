# Vercel + Supabase deployment

## 1. Prepare Supabase

1. Create a new Supabase project.
2. Run `supabase/migrations/202605160001_initial_schema.sql`.
3. Confirm the private bucket `task-attachments` exists.
4. In Auth settings, add your production domain and callback URLs.

## 2. Configure Vercel

Import the repository into Vercel. The project uses standard Next.js defaults, so no `vercel.json` is required.

Set these environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

Rules:

- `NEXT_PUBLIC_*` values are public.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- never place database passwords or service-role keys in client components

## 3. Build settings

- Install command: `npm install`
- Build command: `npm run build`
- Output: Vercel-managed Next.js output

## 4. Post-deploy checks

1. Open `/ar/auth/sign-up`.
2. Create an account.
3. Create the first workspace.
4. Create a project and task.
5. Upload an attachment.
6. Open the same task in another session and verify realtime task/comment updates.
7. Confirm `/ar` is RTL and `/en` is LTR.

## 5. Storage flow

The browser uploads directly to the private `task-attachments` bucket using the authenticated user session and storage RLS. Metadata is then written through the route handler at:

```text
/{locale}/api/attachments
```

File opens use:

```text
/{locale}/api/attachments/{attachmentId}
```

which returns a short-lived signed URL.
