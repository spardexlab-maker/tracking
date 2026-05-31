# Security report

## Core model

- Supabase Auth is the only authentication system.
- RLS is enabled on every user-facing table.
- Workspace membership is the central authorization boundary.
- Role checks are enforced in SQL policies, not only in React.

## Roles

- `owner`, `admin`: workspace management
- `manager`: project/status management
- `member`: task contribution
- `viewer`: read-only access

## Storage security

- `task-attachments` is private.
- Object paths include workspace and task IDs.
- Storage RLS verifies both workspace membership and task access.
- Files are opened via short-lived signed URLs.

## Service role handling

- `SUPABASE_SERVICE_ROLE_KEY` is declared only as a server-side environment variable.
- Client components use the anon key only.
- The current implementation keeps service-role usage minimal and does not expose it to the browser.

## Input and route safety

- Server actions and route handlers validate inputs with Zod.
- Dashboard routes require an authenticated user.
- Privileged operations remain constrained by RLS even if a client tampers with form data.

## Important remaining work before public launch

- Add rate limiting / abuse protection for auth and invitation endpoints.
- Add email delivery and invitation acceptance hardening.
- Add automated RLS tests in CI against a real Supabase project.
- Add structured security logging and alerting.
