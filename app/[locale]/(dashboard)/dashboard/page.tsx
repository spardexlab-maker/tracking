import Link from "next/link";
import {
  Activity,
  Clock,
  CheckCircle2,
  Inbox,
  ListTodo,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getAdminDashboardMetrics,
  getEmployeeDashboardMetrics,
} from "@/lib/db/dashboard";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/i18n/format";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);

  const isLeader = ["owner", "admin", "manager"].includes(context!.role);
  const metrics = isLeader
    ? await getAdminDashboardMetrics(context!.workspace.id)
    : await getEmployeeDashboardMetrics(context!.workspace.id, user.id);

  const cards = [
    {
      title: dict.dashboard.totalTasks,
      value: metrics.totalTasks,
      icon: ListTodo,
      variant: "primary" as const,
    },
    {
      title: locale === "ar" ? "المهام الغير مستلمة" : "Unreceived Tasks",
      value: metrics.unreceivedTasks,
      icon: Inbox,
      variant: "warning" as const,
    },
    {
      title: locale === "ar" ? "المهام المتبقية" : "Remaining Tasks",
      value: metrics.remainingTasks,
      icon: Clock,
      variant: "default" as const,
    },
    {
      title: dict.dashboard.completedTasks,
      value: metrics.completedTasks,
      icon: CheckCircle2,
      variant: "success" as const,
    },
  ];

  const priorityLabels = {
    low: dict.common.low,
    medium: dict.common.medium,
    high: dict.common.high,
    urgent: dict.common.urgent,
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dict.dashboard.greeting}${
          user.user_metadata.full_name ? `، ${user.user_metadata.full_name}` : ""
        }`}
        description={context!.workspace.name}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        {/* Task List */}
        <div className="enterprise-panel overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-lg font-semibold">
              {isLeader
                ? locale === "ar"
                  ? "كل مهام المؤسسة"
                  : "All Workspace Tasks"
                : dict.tasks.myTasks}
            </h2>
            <Link
              href={`/${locale}/tasks`}
              className="text-sm font-medium text-primary hover:opacity-80"
            >
              {dict.common.all}
            </Link>
          </div>

          {metrics.tasks.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              {dict.tasks.emptyState}
            </p>
          ) : (
            <div className="divide-y">
              {metrics.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/${locale}/tasks/${task.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <ListTodo className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        #{task.task_number} {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground flex gap-3 flex-wrap">
                        <span>
                          {dict.common.priority}:{" "}
                          {priorityLabels[
                            task.priority as keyof typeof priorityLabels
                          ] ?? task.priority}
                        </span>
                        <span>•</span>
                        <span>
                          {dict.common.dueDate}: {formatDate(task.due_date, locale)}
                        </span>
                        {isLeader && task.assignee && (
                          <>
                            <span>•</span>
                            <span>
                              {dict.common.assignee}: {task.assignee.full_name ?? task.assignee.email}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const isUnreceived = task.assignee && !task.received_at && !task.status?.is_done;
                      const statusText = isUnreceived
                        ? (locale === "ar" ? "غير مستلمة" : "Unreceived")
                        : (locale === "ar" ? task.status?.name_ar : task.status?.name);
                      const statusVariant = isUnreceived ? "warning" : (task.status?.is_done ? "success" : "info");
                      return (
                        <>
                          <StatusBadge variant={statusVariant}>
                            {statusText}
                          </StatusBadge>
                          {task.completion_requested_at && !task.delivery_approved_at ? (
                            <StatusBadge variant="warning">
                              {dict.tasks.completionPending}
                            </StatusBadge>
                          ) : null}
                          {task.completion_requested_at && task.delivery_approved_at && !task.transferred_to_pm_at && !task.completion_approved_at ? (
                            <StatusBadge variant="success">
                              {dict.tasks.delivered}
                            </StatusBadge>
                          ) : null}
                          {task.completion_requested_at && task.transferred_to_pm_at && !task.completion_approved_at ? (
                            <StatusBadge variant="info">
                              {dict.tasks.awaitingPmSignOff}
                            </StatusBadge>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="enterprise-panel overflow-hidden h-fit">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold">{dict.dashboard.recentActivity}</h2>
          </div>

          {metrics.recentActivity.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">—</p>
          ) : (
            <div className="divide-y">
              {metrics.recentActivity.map((activity) => {
                const task = Array.isArray(activity.task)
                  ? activity.task[0]
                  : activity.task;
                return (
                  <div key={activity.id} className="flex gap-3 px-5 py-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Activity className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {
                          dict.activityTypes[
                            activity.activity_type as keyof typeof dict.activityTypes
                          ] ?? activity.activity_type
                        }
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {task?.title ?? "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
