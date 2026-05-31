# UI ZIP Integration Plan

## 1. ZIP structure summary

- Source extracted to `_v0-ui-source/`.
- Framework: Next.js App Router + React + TypeScript.
- Styling: Tailwind CSS v4 with shadcn-style design tokens in `app/globals.css`.
- Key visual modules:
  - `components/dashboard/sidebar.tsx`
  - `components/dashboard/header.tsx`
  - `components/dashboard/stat-card.tsx`
  - `components/dashboard/status-badge.tsx`
- Demo pages included for:
  - dashboard
  - projects
  - tasks
  - task details
  - calendar
  - reports
  - settings
  - sign-in
- The ZIP contains many optional Radix/shadcn primitives and extra packages, but the approved visual direction can be adopted without importing the demo-only pages or their fake data.

## 2. Current project structure summary

- Current app already uses:
  - Next.js App Router
  - locale-aware routes under `app/[locale]/`
  - Supabase server data access in `lib/db/*`
  - server actions in `lib/actions/*`
  - role-aware navigation and route protection
  - Arabic-first dictionaries and RTL document direction
- Production routes currently in use:
  - dashboard
  - projects + project detail
  - tasks + task detail
  - calendar
  - reports
  - settings
  - auth/onboarding/invite flows
- Existing UI primitives already cover the required production surfaces:
  - buttons, cards, inputs, selects, dialogs, sheets, badges, tables, etc.

## 3. v0 UI elements to adopt

- Visual language:
  - enterprise blue/slate palette
  - dark right-side sidebar for RTL
  - lighter content canvas
  - flatter spacing rhythm and stronger information hierarchy
- Reusable components to adapt:
  - stat cards
  - status badges
  - sidebar shell
  - dashboard header treatment
  - table/card styling patterns
  - empty-state and section-header composition
- Page-level patterns to carry over:
  - metric cards on dashboard/reports
  - bordered content panels
  - compact data tables
  - search/filter bars
  - project cards with progress metadata
  - task detail summary blocks

## 4. Existing files expected to change

- Global styling:
  - `app/globals.css`
- Layout shell:
  - `app/[locale]/(dashboard)/layout.tsx`
  - `components/layout/sidebar.tsx`
  - `components/layout/mobile-nav.tsx`
  - `components/layout/notification-center.tsx`
- Reusable visual components:
  - new files under `components/dashboard/`
- Production pages:
  - `app/[locale]/(dashboard)/dashboard/page.tsx`
  - `app/[locale]/(dashboard)/projects/page.tsx`
  - `app/[locale]/(dashboard)/projects/[projectId]/page.tsx`
  - `app/[locale]/(dashboard)/tasks/page.tsx`
  - `app/[locale]/(dashboard)/tasks/[taskId]/page.tsx`
  - `app/[locale]/(dashboard)/reports/page.tsx`
  - `app/[locale]/(dashboard)/settings/page.tsx`
- Existing forms may receive styling-only updates:
  - `components/projects/project-form.tsx`
  - `components/tasks/task-form.tsx`
  - `components/tasks/upload-attachment-form.tsx`

## 5. Files that must not be touched

- Environment and secrets:
  - `.env`
  - `.env.local`
  - any secret-bearing runtime config
- Data/security logic:
  - `lib/supabase/*`
  - `lib/actions/*`
  - `lib/db/*`
  - `lib/auth/*`
  - `lib/permissions/*`
  - `supabase/migrations/*`
- Existing API contracts:
  - `app/[locale]/api/*`

## 6. Risks

- ZIP pages use fake/demo data; importing them directly would sever real Supabase connections.
- ZIP source uses additional Radix packages not installed in the current app; copying components blindly could enlarge the dependency surface and break the build.
- RTL needs deliberate placement of sidebar, alignment, spacing, and icon order rather than LTR classes pasted unchanged.
- Existing pages already contain recent role/approval behavior; visual refactors must not hide or regress those flows.

## 7. Step-by-step integration plan

1. Reconcile global tokens with the approved v0 palette while preserving current Cairo font, dark-mode hooks, and existing Tailwind setup.
2. Add small reusable visual components (`StatCard`, `StatusBadge`, section helpers) using the current dependency set.
3. Restyle the dashboard shell:
   - sidebar
   - mobile drawer
   - sticky header
   - notification trigger
4. Upgrade the dashboard page using real metric/activity/project data.
5. Upgrade projects list and project detail pages using existing queries/actions/forms.
6. Upgrade tasks list and task detail pages while preserving:
   - role-based visibility
   - completion approval workflow
   - comments
   - attachments
7. Upgrade reports/settings pages using existing real data.
8. Keep auth, Supabase, actions, routes, and database untouched.
9. Run lint, TypeScript, and production build.
10. Verify the real routes visually in the local browser at desktop and mobile widths.

## 8. Testing/build plan

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual browser verification:
  - `/ar/dashboard`
  - `/ar/projects`
  - `/ar/tasks`
  - `/ar/reports`
  - `/ar/settings`
  - a project detail page
  - a task detail page
- Responsive checks:
  - mobile drawer/navigation
  - table overflow
  - card wrapping
  - Arabic RTL alignment

