import { BarChart3, CheckCircle2, ListTodo } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getReports } from "@/lib/db/reports";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);
  const reports = await getReports(context!.workspace.id);

  const groups = [
    [dict.reports.tasksByStatus, reports.byStatus],
    [dict.reports.tasksByPriority, reports.byPriority],
    [dict.reports.tasksByAssignee, reports.byAssignee],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title={dict.common.reports} description={dict.reports.productivity} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title={dict.dashboard.totalTasks}
          value={reports.totalTasks}
          icon={ListTodo}
          variant="primary"
        />
        <StatCard
          title={dict.dashboard.completedTasks}
          value={reports.completedTasks}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title={dict.reports.productivity}
          value={`${reports.totalTasks === 0 ? 0 : Math.round((reports.completedTasks / reports.totalTasks) * 100)}%`}
          icon={BarChart3}
          variant="default"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {groups.map(([title, rows]) => (
          <div key={title} className="enterprise-panel overflow-hidden">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">{title}</h2>
            </div>
            <div className="grid gap-3 p-5">
              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                rows.map(([label, value]) => {
                  const translatedLabel =
                    label === "Pending"
                      ? dict.common.pending
                      : label === "In Progress"
                        ? dict.common.inProgress
                        : label === "Completed"
                          ? dict.common.completed
                          : dict.common[label as keyof typeof dict.common] ?? label;

                  return (
                    <div
                      key={label}
                      className="enterprise-muted-panel flex items-center justify-between gap-4 p-3"
                    >
                      <span className="text-sm text-muted-foreground">{translatedLabel}</span>
                      <span className="font-semibold tabular-nums">{value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
