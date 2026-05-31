# Arabic localization report

## Status

- Arabic is the default locale.
- English remains available as a secondary locale.
- `html lang="ar" dir="rtl"` is applied for Arabic.
- Cairo is used as the primary UI font for Arabic readability.

## Implemented

- Auth screens
- Onboarding
- Navigation
- Dashboard
- Projects
- Tasks
- Kanban labels
- Comments
- Attachments
- Reports
- Settings
- Activity labels
- Notification labels

## RTL handling

- Locale routing lives under `app/[locale]/`.
- The root locale layout sets `dir` and `lang`.
- Mobile drawer opens from the right in Arabic.
- Logical CSS utilities (`border-e`, `me`, `end`) are used where direction matters.
- Kanban keeps horizontal scrolling on narrow screens rather than breaking the page.

## Terminology

The provided glossary was used as the baseline. Arabic text was written as natural business Arabic rather than literal word-for-word translation.

## Remaining localization limits

- Invitation emails are not yet implemented, so no email-template translation exists yet.
- Stored database activity payloads remain language-neutral; the UI translates visible event labels at render time.
