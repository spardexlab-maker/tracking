import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getCalendarTasks } from "@/lib/db/tasks";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";
import { normalizeLocale } from "@/lib/i18n/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);
  const tasks = await getCalendarTasks(context!.workspace.id);

  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const key = task.due_date ?? "undated";
    acc[key] = [...(acc[key] ?? []), task];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title={dict.calendar.title} description={context!.workspace.name} />
      {tasks.length === 0 ? (
        <Card className="py-0">
          <CardContent className="p-6 text-sm text-muted-foreground">
            {dict.calendar.emptyState}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, rows]) => (
          <Card key={date} className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{formatDate(date, locale)}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 py-4">
              {rows.map((task) => {
                const project = Array.isArray(task.project)
                  ? task.project[0]
                  : task.project;
                const status = Array.isArray(task.status)
                  ? task.status[0]
                  : task.status;
                return (
                  <Link
                    key={task.id}
                    href={`/${locale}/tasks/${task.id}`}
                    className="grid gap-2 rounded-2xl border bg-background p-3 transition hover:bg-muted/40 sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-medium">
                        #{task.task_number} {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project?.name}
                      </p>
                    </div>
                    <StatusBadge variant={status?.is_done ? "success" : "info"}>
                      {locale === "ar" ? status?.name_ar : status?.name}
                    </StatusBadge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
