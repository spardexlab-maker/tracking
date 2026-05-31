import { notFound } from "next/navigation";
import {
  addChecklistItemAction,
  approveTaskCompletionAction,
  assignLabelAction,
  archiveTaskAction,
  createLabelAction,
  deleteTaskAction,
  removeLabelAction,
  toggleChecklistItemAction,
  updateTaskAction,
  updateTaskProgressAction,
  receiveTaskAction,
} from "@/lib/actions/task";
import { requireUser } from "@/lib/auth/session";
import {
  getTask,
  getTaskDetailCollections,
  getTaskLabels,
  getTaskStatuses,
} from "@/lib/db/tasks";
import { getActiveWorkspaceContext, getWorkspaceMembers } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";
import { normalizeLocale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadAttachmentForm } from "@/components/tasks/upload-attachment-form";
import { AttachmentList } from "@/components/tasks/attachment-list";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { StatusBadge } from "@/components/dashboard/status-badge";

const taskManagers = new Set(["owner", "admin", "manager"]);

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ locale: string; taskId: string }>;
}) {
  const { locale: rawLocale, taskId } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const [task, context] = await Promise.all([
    getTask(taskId),
    getActiveWorkspaceContext(user.id),
  ]);
  const dict = getDictionary(locale);

  if (!task) {
    notFound();
  }

  const canManageTask = taskManagers.has(context!.role);
  const needsReceipt = task.assignee_id === user.id && !task.received_at;
  const canUpdateProgress = canManageTask || (task.assignee_id === user.id && !needsReceipt);
  const detailPromise = getTaskDetailCollections(task.id);
  const labelsPromise = canManageTask
    ? getTaskLabels(task.workspace_id)
    : Promise.resolve([]);
  const statusesPromise = getTaskStatuses(task.workspace_id);
  const membersPromise = canManageTask
    ? getWorkspaceMembers(task.workspace_id)
    : Promise.resolve([]);
  const [detail, availableLabels, statuses, members] = await Promise.all([
    detailPromise,
    labelsPromise,
    statusesPromise,
    membersPromise,
  ]);
  const status = Array.isArray(task.status) ? task.status[0] : task.status;
  const assignee = Array.isArray(task.assignee) ? task.assignee[0] : task.assignee;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <RealtimeRefresh
        channelName={`task-comments:${task.id}`}
        table="task_comments"
        filter={`task_id=eq.${task.id}`}
      />

      <section className="space-y-4">
        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>
              #{task.task_number} {task.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              {task.description || "—"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="enterprise-muted-panel flex items-center gap-2 p-3 text-sm">
                <span className="text-muted-foreground">{dict.common.status}: </span>
                <StatusBadge variant={status?.is_done ? "success" : "info"}>
                  {locale === "ar" ? status?.name_ar : status?.name}
                </StatusBadge>
              </p>
              <p className="enterprise-muted-panel p-3 text-sm">
                <span className="text-muted-foreground">{dict.common.assignee}: </span>
                {assignee?.full_name ?? assignee?.email ?? dict.common.unassigned}
              </p>
              <p className="enterprise-muted-panel p-3 text-sm">
                <span className="text-muted-foreground">{dict.tasks.assignedAt}: </span>
                {task.assigned_at ? formatDate(task.assigned_at, locale) : "—"}
              </p>
              <p className="enterprise-muted-panel p-3 text-sm">
                <span className="text-muted-foreground">{dict.tasks.receivedAt}: </span>
                {task.received_at ? formatDate(task.received_at, locale) : dict.tasks.notReceived}
              </p>
              <p className="enterprise-muted-panel p-3 text-sm">
                <span className="text-muted-foreground">{dict.common.dueDate}: </span>
                {formatDate(task.due_date, locale)}
              </p>
            </div>
            {task.completion_requested_at && !task.completion_approved_at && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {dict.tasks.completionPending}
              </div>
            )}
          </CardContent>
        </Card>

        {needsReceipt && (
          <Card className="border-amber-200 bg-amber-50/50 py-0">
            <CardHeader className="border-b border-amber-100 py-4">
              <CardTitle className="text-amber-800">{dict.tasks.receiveTask}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <p className="text-sm text-amber-700">
                {dict.tasks.receiveNotice}
              </p>
              <form action={receiveTaskAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <Button className="w-full sm:w-fit bg-amber-600 hover:bg-amber-700 text-white">
                  {dict.tasks.receiveTask}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canManageTask && task.completion_requested_at && !task.completion_approved_at && (
          <Card id="progress" className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.completionPending}</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <form action={approveTaskCompletionAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Button>{dict.tasks.approveCompletion}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canUpdateProgress && (
          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.progressUpdate}</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <form action={updateTaskProgressAction} className="grid gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <select
                  name="statusId"
                  defaultValue={status?.id}
                  className="h-11 rounded-xl border bg-background px-3 text-sm"
                >
                  {statuses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === "ar" ? item.name_ar : item.name}
                    </option>
                  ))}
                </select>
                <Textarea
                  name="note"
                  placeholder={dict.tasks.progressNote}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {dict.tasks.progressHint}
                </p>
                <Button className="h-11 w-full sm:w-fit">{dict.common.save}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canManageTask && (
          <Card className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.editTask}</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <form action={updateTaskAction} className="grid gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Input name="title" defaultValue={task.title} className="h-11" />
                <Textarea name="description" defaultValue={task.description ?? ""} />
                <select
                  name="statusId"
                  defaultValue={status?.id}
                  className="h-11 rounded-xl border bg-background px-3 text-sm"
                >
                  {statuses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === "ar" ? item.name_ar : item.name}
                    </option>
                  ))}
                </select>
                <Select key={`priority-${task.priority}`} name="priority" defaultValue={task.priority}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{dict.common.low}</SelectItem>
                    <SelectItem value="medium">{dict.common.medium}</SelectItem>
                    <SelectItem value="high">{dict.common.high}</SelectItem>
                    <SelectItem value="urgent">{dict.common.urgent}</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  key={`assignee-${task.assignee_id ?? "unassigned"}`}
                  name="assigneeId"
                  defaultValue={task.assignee_id ?? undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={dict.common.unassigned} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => {
                      const profile = Array.isArray(member.user)
                        ? member.user[0]
                        : member.user;
                      return (
                        <SelectItem key={member.id} value={profile.id}>
                          {profile.full_name ?? profile.email}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input name="startDate" type="date" defaultValue={task.start_date ?? ""} />
                <Input name="dueDate" type="date" defaultValue={task.due_date ?? ""} />
                <Button>{dict.common.update}</Button>
              </form>
              <form action={archiveTaskAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <Button variant="outline">{dict.common.archive}</Button>
              </form>
              <form action={deleteTaskAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Button variant="destructive">{dict.common.delete}</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>

      <aside className="space-y-4">
        {canManageTask && (
          <>
            <Card className="py-0">
              <CardHeader className="border-b py-4">
                <CardTitle>{dict.tasks.checklist}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 py-4">
                <form action={addChecklistItemAction} className="flex gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="workspaceId" value={task.workspace_id} />
                  <Input name="title" required />
                  <Button size="sm">{dict.common.create}</Button>
                </form>
                <div className="grid gap-2">
                  {detail.checklist.map((item) => (
                    <form
                      key={item.id}
                      action={toggleChecklistItemAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="isDone" value={String(item.is_done)} />
                      <Checkbox checked={item.is_done} />
                      <button className="text-sm">{item.title}</button>
                    </form>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardHeader className="border-b py-4">
                <CardTitle>{dict.tasks.labels}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {detail.labels.map((assignment) => {
                    const label = Array.isArray(assignment.label)
                      ? assignment.label[0]
                      : assignment.label;
                    return (
                      <form key={assignment.id} action={removeLabelAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ borderColor: label?.color }}
                        >
                          {label?.name} ×
                        </Button>
                      </form>
                    );
                  })}
                </div>

                <form action={assignLabelAction} className="grid gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="taskId" value={task.id} />
                  <Select name="labelId">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={dict.tasks.labels} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLabels.map((label) => (
                        <SelectItem key={label.id} value={label.id}>
                          {label.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">{dict.common.create}</Button>
                </form>

                <form
                  action={createLabelAction}
                  className="grid gap-2 sm:grid-cols-[1fr_110px]"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="taskId" value={task.id} />
                  <input type="hidden" name="workspaceId" value={task.workspace_id} />
                  <Input name="name" placeholder={dict.tasks.labels} required />
                  <Input name="color" type="color" defaultValue="#0f766e" required />
                  <Button className="sm:col-span-2">{dict.common.create}</Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        <Card id="attachments" className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>{dict.common.attachments}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            {!needsReceipt && (
              <UploadAttachmentForm
                locale={locale}
                dict={dict}
                workspaceId={task.workspace_id}
                taskId={task.id}
              />
            )}
            <AttachmentList
              locale={locale}
              dict={dict}
              attachments={detail.attachments}
            />
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>{dict.tasks.activityTimeline}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 py-4">
            {detail.activities.map((activity) => (
              <div key={activity.id} className="rounded-2xl border bg-background p-3">
                <p className="text-sm font-medium">
                  {
                    dict.activityTypes[
                      activity.activity_type as keyof typeof dict.activityTypes
                    ] ?? activity.activity_type
                  }
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(activity.created_at, locale)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      {canUpdateProgress ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 shadow-lg backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
            <a
              href="#progress"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              {dict.tasks.progressUpdate}
            </a>
            <a
              href="#attachments"
              className="inline-flex h-11 items-center justify-center rounded-xl border bg-card px-3 text-sm font-medium"
            >
              {dict.common.attachments}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
