# Masar

Masar is a clean-room, Arabic-first project and task management web app inspired by the product shape of Worklenz, but implemented from scratch for a Vercel + Supabase-only architecture.

## Stack

- Next.js App Router
- React + TypeScript strict mode
- TailwindCSS + ShadCN UI
- Supabase Postgres, Auth, Storage, and Realtime
- Zod validation
- date-fns localization

## Implemented product areas

- Email/password authentication
- Workspace onboarding
- Workspace roles and member/invitation schema
- Project creation, archive flow, and project dashboard
- Task creation, assignment, comments, checklist, attachments, activity history
- Dashboard metrics
- Kanban board and personal task list
- Realtime notifications, task refresh, and comment refresh
- Reports page
- Arabic default locale with RTL layout and English secondary locale
- Mobile drawer navigation and responsive card-first layouts

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
copy .env.example .env.local
```

3. Fill `.env.local` with your Supabase values.

4. Apply the SQL migration from `supabase/migrations/`.

5. Start the app:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

The root path redirects to Arabic by default.

## Verification commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Clean-room note

Worklenz was used only as feature inspiration. No large source-code blocks were copied into this project.
