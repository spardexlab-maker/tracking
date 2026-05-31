import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderKanban, UserRoundPlus } from "lucide-react";
import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "@/lib/actions/project-member";
import { updateProjectAction } from "@/lib/actions/project";
import { requireUser } from "@/lib/auth/session";
import { getProject, getProjectMembers } from "@/lib/db/projects";
import { getProjectTasks, getTaskStatuses } from "@/lib/db/tasks";
import { getActiveWorkspaceContext, getWorkspaceMembers } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { TaskForm } from "@/components/tasks/task-form";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const projectManagers = new Set(["owner", "admin", "manager"]);

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale: rawLocale, projectId } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const canManageProject = projectManagers.has(context!.role);

  const [project, statuses, tasks, members, projectMembers] = await Promise.all([
    getProject(projectId),
    getTaskStatuses(context!.workspace.id),
    getProjectTasks(projectId),
    canManageProject ? getWorkspaceMembers(context!.workspace.id) : Promise.resolve([]),
    canManageProject ? getProjectMembers(projectId) : Promise.resolve([]),
  ]);
  const dict = getDictionary(locale);

  if (!project) {
    notFound();
  }

  const completedTasks = tasks.filter((task) => {
    const status = Array.isArray(task.status) ? task.status[0] : task.status;
    return status?.is_done;
  }).length;

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        channelName={`project-tasks:${project.id}`}
        table="tasks"
        filter={`project_id=eq.${project.id}`}
      />

      <div className="enterprise-panel p-5">
        <PageHeader
          title={project.name}
          description={`${completedTasks} / ${tasks.length} ${dict.common.tasks}`}
          action={
            canManageProject ? (
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
                      projectId={project.id}
                      statuses={statuses}
                      members={members}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ) : undefined
          }
        />

        {canManageProject ? (
          <form action={updateProjectAction} className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="projectId" value={project.id} />
            <input
              name="name"
              defaultValue={project.name}
              className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-4 text-sm"
            />
            <Button className="h-11">{dict.common.update}</Button>
          </form>
        ) : null}
      </div>

      {canManageProject ? (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.settings.projectMembers}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 py-4">
              {projectMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                projectMembers.map((member) => {
                  const profile = Array.isArray(member.user) ? member.user[0] : member.user;
                  return (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {profile?.full_name ?? profile?.email}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                      <form action={removeProjectMemberAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <Button variant="outline" size="sm">
                          {dict.common.delete}
                        </Button>
                      </form>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2">
                <UserRoundPlus className="size-4" />
                {dict.common.members}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <form action={addProjectMemberAction} className="grid gap-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="projectId" value={project.id} />
                <Select name="userId">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={dict.common.members} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => {
                      const profile = Array.isArray(member.user) ? member.user[0] : member.user;
                      return (
                        <SelectItem key={member.id} value={profile.id}>
                          {profile.full_name ?? profile.email}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button>{dict.common.create}</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{dict.common.tasks}</h2>
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        </div>

        {tasks.length === 0 ? (
          <div className="enterprise-panel flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">{dict.tasks.emptyState}</p>
          </div>
        ) : (
          <div className="enterprise-panel overflow-hidden">
            <div className="divide-y">
              {tasks.map((task) => {
                const status = Array.isArray(task.status) ? task.status[0] : task.status;
                const assignee = Array.isArray(task.assignee)
                  ? task.assignee[0]
                  : task.assignee;
                return (
                  <Link
                    key={task.id}
                    href={`/${locale}/tasks/${task.id}`}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        #{task.task_number} {task.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {assignee?.full_name ?? assignee?.email ?? dict.common.unassigned}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={status?.is_done ? "success" : "info"}>
                        {locale === "ar" ? status?.name_ar : status?.name}
                      </StatusBadge>
                      {task.completion_requested_at && !task.completion_approved_at ? (
                        <StatusBadge variant="warning">
                          {dict.tasks.completionPending}
                        </StatusBadge>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{dict.common.kanbanBoard}</h2>
        <KanbanBoard
          locale={locale}
          dict={dict}
          projectId={project.id}
          statuses={statuses}
          tasks={tasks}
          allowQuickStatusChange={canManageProject}
        />
      </section>
    </div>
  );
}
