import Link from "next/link";
import { Search } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMyTasks, getWorkspaceTasks, getTaskStatuses } from "@/lib/db/tasks";
import { getActiveWorkspaceContext, getWorkspaceMembers, getOrCreateDefaultProject } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";
import { normalizeLocale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const leaders = new Set(["owner", "admin", "manager"]);

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    priority?: string;
    projectId?: string;
    hideCompleted?: string;
    pendingApproval?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const { q, priority, hideCompleted, pendingApproval } =
    await searchParams;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);
  const isLeader = leaders.has(context!.role);

  if (isLeader) {
    const defaultProjectId = await getOrCreateDefaultProject(
      context!.workspace.id,
      user.id,
    );

    const [tasks, statuses, members] = await Promise.all([
      getWorkspaceTasks(context!.workspace.id, {
        search: q,
        projectId: defaultProjectId,
        hideCompleted: hideCompleted === "on",
        pendingApproval: pendingApproval === "on",
      }),
      getTaskStatuses(context!.workspace.id),
      getWorkspaceMembers(context!.workspace.id),
    ]);

    return (
      <div className="space-y-6">
        <PageHeader
          title={dict.tasks.allTasks}
          description={context!.workspace.name}
          action={
            <Sheet>
              <SheetTrigger render={<Button />}>{dict.tasks.createTask}</SheetTrigger>
              <SheetContent
                side={locale === "ar" ? "left" : "right"}
                className="w-full overflow-y-auto sm:max-w-xl"
              >
                <SheetHeader className="text-start">
                  <SheetTitle>{dict.tasks.createTask}</SheetTitle>
                  <SheetDescription>{dict.tasks.createTaskPanelHint}</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-4">
                  <TaskForm
                    locale={locale}
                    dict={dict}
                    workspaceId={context!.workspace.id}
                    projectId={defaultProjectId}
                    statuses={statuses}
                    members={members}
                  />
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        <form className="enterprise-panel grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative">
            <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder={dict.common.search}
              className="h-11 w-full rounded-xl border bg-background px-4 pe-10 text-sm"
            />
          </label>
          <Button className="h-11 px-5">{dict.common.filter}</Button>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="hideCompleted"
              defaultChecked={hideCompleted === "on"}
            />
            <span>{dict.tasks.hideCompleted}</span>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="pendingApproval"
              defaultChecked={pendingApproval === "on"}
            />
            <span>{dict.tasks.completionPending}</span>
          </label>
        </form>

        <div className="grid gap-3 md:hidden">
          {tasks.map((task) => {
            const project = Array.isArray(task.project) ? task.project[0] : task.project;
            const assignee = Array.isArray(task.assignee) ? task.assignee[0] : task.assignee;
            const status = Array.isArray(task.status) ? task.status[0] : task.status;
            return (
              <Link
                key={task.id}
                href={`/${locale}/tasks/${task.id}`}
                className="enterprise-panel block p-4"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <StatusBadge variant={status?.is_done ? "success" : "info"}>
                    {locale === "ar" ? status?.name_ar : status?.name}
                  </StatusBadge>
                  {task.completion_requested_at && !task.completion_approved_at ? (
                    <StatusBadge variant="warning">
                      {dict.tasks.completionPending}
                    </StatusBadge>
                  ) : null}
                </div>
                <p className="font-semibold">#{task.task_number} {task.title}</p>
                <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  <p>{dict.tasks.projectTable}: {project?.name ?? "—"}</p>
                  <p>{dict.tasks.assigneeTable}: {assignee?.full_name ?? assignee?.email ?? dict.common.unassigned}</p>
                  <p>{dict.tasks.deliveryDate}: {formatDate(task.due_date, locale)}</p>
                </div>
              </Link>
            );
          })}
          {tasks.length === 0 ? (
            <div className="enterprise-panel p-6 text-sm text-muted-foreground">
              {dict.tasks.emptyState}
            </div>
          ) : null}
        </div>

        <Card className="hidden py-0 md:block">
          <CardContent className="p-0">
            <Table className="data-table">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>{dict.common.task}</TableHead>
                  <TableHead>{dict.tasks.projectTable}</TableHead>
                  <TableHead>{dict.tasks.assigneeTable}</TableHead>
                  <TableHead>{dict.common.status}</TableHead>
                  <TableHead>{dict.tasks.deliveryDate}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const project = Array.isArray(task.project) ? task.project[0] : task.project;
                  const assignee = Array.isArray(task.assignee)
                    ? task.assignee[0]
                    : task.assignee;
                  const status = Array.isArray(task.status) ? task.status[0] : task.status;
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Link
                          href={`/${locale}/tasks/${task.id}`}
                          className="font-medium hover:text-primary"
                        >
                          #{task.task_number} {task.title}
                        </Link>
                      </TableCell>
                      <TableCell>{project?.name ?? "—"}</TableCell>
                      <TableCell>
                        {assignee?.full_name ?? assignee?.email ?? dict.common.unassigned}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge variant={status?.is_done ? "success" : "info"}>
                            {locale === "ar" ? status?.name_ar : status?.name}
                          </StatusBadge>
                          {task.completion_requested_at && !task.completion_approved_at ? (
                            <StatusBadge variant="warning">
                              {dict.tasks.completionPending}
                            </StatusBadge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(task.due_date, locale)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {tasks.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">{dict.tasks.emptyState}</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  const tasks = await getMyTasks(context!.workspace.id, user.id, {
    search: q,
    priority,
    hideCompleted: hideCompleted === "on",
  });

  return (
    <div className="space-y-6">
      <PageHeader title={dict.tasks.myTasks} description={context!.workspace.name} />

      <form className="enterprise-panel grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <label className="relative">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder={dict.common.search}
            className="h-11 w-full rounded-xl border bg-background px-4 pe-10 text-sm"
          />
        </label>
        <select
          name="priority"
          defaultValue={priority ?? ""}
          className="h-11 rounded-xl border bg-background px-3 text-sm"
        >
          <option value="">{dict.common.all}</option>
          <option value="low">{dict.common.low}</option>
          <option value="medium">{dict.common.medium}</option>
          <option value="high">{dict.common.high}</option>
          <option value="urgent">{dict.common.urgent}</option>
        </select>
        <Button className="h-11 px-5">{dict.common.filter}</Button>
        <label className="flex items-center gap-2 text-sm sm:col-span-3">
          <input
            type="checkbox"
            name="hideCompleted"
            defaultChecked={hideCompleted === "on"}
          />
          <span>{dict.tasks.hideCompleted}</span>
        </label>
      </form>

      <div className="grid gap-3 md:hidden">
        {tasks.map((task) => {
          const project = Array.isArray(task.project) ? task.project[0] : task.project;
          const status = Array.isArray(task.status) ? task.status[0] : task.status;
          return (
            <Link
              key={task.id}
              href={`/${locale}/tasks/${task.id}`}
              className="enterprise-panel block p-4"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge variant={status?.is_done ? "success" : "info"}>
                  {locale === "ar" ? status?.name_ar : status?.name}
                </StatusBadge>
                {task.completion_requested_at && !task.completion_approved_at ? (
                  <StatusBadge variant="warning">
                    {dict.tasks.completionPending}
                  </StatusBadge>
                ) : null}
              </div>
              <p className="font-semibold">#{task.task_number} {task.title}</p>
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                <p>{dict.tasks.projectTable}: {project?.name ?? "—"}</p>
                <p>{dict.tasks.deliveryDate}: {formatDate(task.due_date, locale)}</p>
              </div>
            </Link>
          );
        })}
        {tasks.length === 0 ? (
          <div className="enterprise-panel p-6 text-sm text-muted-foreground">
            {dict.tasks.emptyState}
          </div>
        ) : null}
      </div>

      <Card className="hidden py-0 md:block">
        <CardContent className="p-0">
          <Table className="data-table">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>{dict.common.task}</TableHead>
                <TableHead>{dict.tasks.projectTable}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.tasks.deliveryDate}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const project = Array.isArray(task.project) ? task.project[0] : task.project;
                const status = Array.isArray(task.status) ? task.status[0] : task.status;
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/${locale}/tasks/${task.id}`}
                        className="font-medium hover:text-primary"
                      >
                        #{task.task_number} {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>{project?.name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge variant={status?.is_done ? "success" : "info"}>
                          {locale === "ar" ? status?.name_ar : status?.name}
                        </StatusBadge>
                        {task.completion_requested_at && !task.completion_approved_at ? (
                          <StatusBadge variant="warning">
                            {dict.tasks.completionPending}
                          </StatusBadge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(task.due_date, locale)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {tasks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{dict.tasks.emptyState}</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
