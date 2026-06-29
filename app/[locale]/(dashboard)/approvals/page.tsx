import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { approveTaskDeliveryAction, transferTaskToPmAction, approveTaskCompletionAction } from "@/lib/actions/task";
import { requireUser } from "@/lib/auth/session";
import { getPendingApprovalTasks } from "@/lib/db/tasks";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";
import { normalizeLocale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const leaders = new Set(["owner", "admin", "manager"]);

export default async function ApprovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);

  if (!leaders.has(context!.role)) {
    redirect(`/${locale}/tasks`);
  }

  const tasks = await getPendingApprovalTasks(context!.workspace.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.tasks.approvals}
        description={dict.tasks.approvalsDescription}
      />

      {tasks.length === 0 ? (
        <div className="enterprise-panel flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-6" />
          </span>
          <p className="font-medium">{dict.tasks.emptyState}</p>
          <p className="text-sm text-muted-foreground">
            {locale === "ar"
              ? "لا توجد طلبات إكمال بانتظار المراجعة حاليًا."
              : "There are no completion requests waiting for review."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => {
            const project = Array.isArray(task.project) ? task.project[0] : task.project;
            const assignee = Array.isArray(task.assignee)
              ? task.assignee[0]
              : task.assignee;
            const status = Array.isArray(task.status) ? task.status[0] : task.status;
            const isStage1 = task.delivery_approved_at === null;
            const isStage2 = task.delivery_approved_at !== null && task.transferred_to_pm_at === null;
            const isStage3 = task.transferred_to_pm_at !== null;

            return (
              <div
                key={task.id}
                className="enterprise-panel grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {isStage1 && (
                      <StatusBadge variant="warning">{dict.tasks.completionPending}</StatusBadge>
                    )}
                    {isStage2 && (
                      <StatusBadge variant="success">{dict.tasks.delivered}</StatusBadge>
                    )}
                    {isStage3 && (
                      <StatusBadge variant="info">{dict.tasks.awaitingPmSignOff}</StatusBadge>
                    )}
                    <StatusBadge variant={status?.is_done ? "success" : "info"}>
                      {locale === "ar" ? status?.name_ar : status?.name}
                    </StatusBadge>
                  </div>
                  <Link
                    href={`/${locale}/tasks/${task.id}`}
                    className="text-lg font-semibold hover:text-primary"
                  >
                    #{task.task_number} {task.title}
                  </Link>
                  <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <p>{dict.common.project}: {project?.name ?? "—"}</p>
                    <p>{dict.common.assignee}: {assignee?.full_name ?? assignee?.email ?? dict.common.unassigned}</p>
                    <p>{dict.tasks.deliveryDate}: {formatDate(task.due_date, locale)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col justify-end">
                  <Link
                    href={`/${locale}/tasks/${task.id}`}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    {dict.tasks.viewTask}
                  </Link>
                  {isStage1 && (
                    <form action={approveTaskDeliveryAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="projectId" value={project?.id ?? ""} />
                      <input type="hidden" name="returnTo" value={`/${locale}/approvals?saved=1`} />
                      <SubmitButton pendingText={dict.tasks.approveDelivery}>
                        {dict.tasks.approveDelivery}
                      </SubmitButton>
                    </form>
                  )}
                  {isStage2 && (
                    <div className="flex flex-wrap gap-2">
                      <form action={transferTaskToPmAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="projectId" value={project?.id ?? ""} />
                        <input type="hidden" name="returnTo" value={`/${locale}/approvals?saved=1`} />
                        <SubmitButton variant="outline" pendingText={dict.tasks.transferToPm}>
                          {dict.tasks.transferToPm}
                        </SubmitButton>
                      </form>
                      <form action={approveTaskCompletionAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="projectId" value={project?.id ?? ""} />
                        <input type="hidden" name="returnTo" value={`/${locale}/approvals?saved=1`} />
                        <SubmitButton pendingText={dict.tasks.markCompleted}>
                          {dict.tasks.markCompleted}
                        </SubmitButton>
                      </form>
                    </div>
                  )}
                  {isStage3 && (
                    <form action={approveTaskCompletionAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="projectId" value={project?.id ?? ""} />
                      <input type="hidden" name="returnTo" value={`/${locale}/approvals?saved=1`} />
                      <SubmitButton pendingText={dict.tasks.approveCompletion}>
                        {dict.tasks.approveCompletion}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
