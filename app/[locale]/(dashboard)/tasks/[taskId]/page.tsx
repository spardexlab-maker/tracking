import { notFound } from "next/navigation";
import {
  addChecklistItemAction,
  approveTaskDeliveryAction,
  transferTaskToPmAction,
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
  updateTaskTitleAction,
  addCommentAction,
} from "@/lib/actions/task";
import { FileText, ImageIcon } from "lucide-react";
import Link from "next/link";
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
            <CardTitle className="w-full">
              {canManageTask ? (
                <form action={updateTaskTitleAction} className="flex flex-wrap items-center gap-3 w-full">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="taskId" value={task.id} />
                  <span className="text-xl font-bold text-muted-foreground shrink-0">#{task.task_number}</span>
                  <Input
                    name="title"
                    defaultValue={task.title}
                    required
                    className="h-10 text-lg font-bold bg-transparent border-none hover:bg-muted/40 focus:bg-background focus:ring-1 px-2 py-1 rounded-xl flex-1 min-w-[200px]"
                  />
                  <Button size="sm" variant="outline" className="h-9 rounded-xl px-3 hover:bg-primary hover:text-primary-foreground text-xs font-semibold shrink-0">
                    {locale === "ar" ? "حفظ العنوان" : "Save Title"}
                  </Button>
                </form>
              ) : (
                <span>#{task.task_number} {task.title}</span>
              )}
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
                {task.created_by === task.assignee_id && (
                  <StatusBadge variant="warning">
                    {dict.tasks.selfAssigned}
                  </StatusBadge>
                )}
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
            {task.completion_requested_at && !task.delivery_approved_at && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {dict.tasks.completionPending}
              </div>
            )}
            {task.completion_requested_at && task.delivery_approved_at && !task.transferred_to_pm_at && !task.completion_approved_at && (
              <div className="rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
                {dict.tasks.delivered}
              </div>
            )}
            {task.completion_requested_at && task.transferred_to_pm_at && !task.completion_approved_at && (
              <div className="rounded-2xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                {dict.tasks.awaitingPmSignOff}
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

        {canManageTask && task.completion_requested_at && !task.delivery_approved_at && (
          <Card id="progress" className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.completionPending}</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <form action={approveTaskDeliveryAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Button>{dict.tasks.approveDelivery}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canManageTask && task.completion_requested_at && task.delivery_approved_at && !task.transferred_to_pm_at && !task.completion_approved_at && (
          <Card id="progress" className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.delivered}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 py-4">
              <form action={transferTaskToPmAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Button variant="outline">{dict.tasks.transferToPm}</Button>
              </form>
              <form action={approveTaskCompletionAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="projectId" value={task.project_id} />
                <Button>{dict.tasks.markCompleted}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canManageTask && task.completion_requested_at && task.transferred_to_pm_at && !task.completion_approved_at && (
          <Card id="progress" className="py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>{dict.tasks.awaitingPmSignOff}</CardTitle>
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
                  defaultValue={task.completion_requested_status_id ?? status?.id}
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

        {/* Notes & Comments Section */}
        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>{dict.tasks.commentsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            {detail.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">
                {dict.tasks.noComments}
              </p>
            ) : (
              <div className="space-y-3">
                {detail.comments.map((comment) => {
                  const authorObj = Array.isArray(comment.author) ? comment.author[0] : comment.author;
                  const authorName = authorObj?.full_name ?? authorObj?.email ?? (locale === "ar" ? "مستخدم غير معروف" : "Unknown User");
                  
                  // Parse attachment if exists in body
                  const attachmentRegex = /\[attachment:([0-9a-fA-F-]{36})\]/;
                  const match = comment.body.match(attachmentRegex);
                  const attachmentId = match ? match[1] : null;
                  const cleanBody = comment.body.replace(attachmentRegex, "").trim();
                  
                  // Find matching attachment from the task attachments collection
                  const linkedAttachment = attachmentId 
                    ? detail.attachments.find(att => att.id === attachmentId)
                    : null;

                  return (
                    <div key={comment.id} className="rounded-2xl border bg-muted/20 p-3 text-start">
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
                        <span className="text-sm font-semibold text-foreground">{authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at, locale)}</span>
                      </div>
                      {cleanBody && (
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{cleanBody}</p>
                      )}
                      
                      {linkedAttachment && (
                        <div className="mt-3 border-t border-border/30 pt-3">
                          {linkedAttachment.mime_type?.startsWith("image/") ? (
                            <Link 
                              href={`/${locale}/api/attachments/${linkedAttachment.id}`}
                              target="_blank"
                              className="block rounded-xl overflow-hidden border max-w-sm hover:opacity-95 transition-opacity"
                            >
                              <img 
                                src={`/${locale}/api/attachments/${linkedAttachment.id}`} 
                                alt={linkedAttachment.file_name} 
                                className="w-full max-h-60 object-contain bg-slate-50 dark:bg-slate-900"
                              />
                            </Link>
                          ) : (
                            <Link
                              href={`/${locale}/api/attachments/${linkedAttachment.id}`}
                              target="_blank"
                              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-xs hover:bg-muted transition-colors max-w-sm"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <FileText className="size-4 shrink-0 text-primary" />
                                <span className="truncate font-medium text-foreground">{linkedAttachment.file_name}</span>
                              </span>
                              <span className="text-primary font-semibold shrink-0">{dict.common.open}</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t pt-4 mt-2">
              <form action={addCommentAction} className="grid gap-3" encType="multipart/form-data">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="workspaceId" value={task.workspace_id} />
                
                <Textarea
                  name="body"
                  placeholder={locale === "ar" ? "أكتب تعليقاً..." : "Write a comment..."}
                  required
                  rows={3}
                  className="resize-none"
                />
                
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors">
                    <span className="text-muted-foreground">{locale === "ar" ? "إرفاق ملف/صورة" : "Attach File/Image"}</span>
                    <input
                      type="file"
                      name="attachment"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const label = e.currentTarget.previousElementSibling;
                          if (label) {
                            label.textContent = file.name;
                          }
                        }
                      }}
                    />
                  </label>
                  <Button size="sm" className="px-5">
                    {locale === "ar" ? "إرسال التعليق" : "Send Comment"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

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
                  defaultValue={task.completion_requested_status_id ?? status?.id}
                  className="h-11 rounded-xl border bg-background px-3 text-sm"
                >
                  {statuses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === "ar" ? item.name_ar : item.name}
                    </option>
                  ))}
                </select>
                <select
                  name="priority"
                  defaultValue={task.priority}
                  className="h-11 rounded-xl border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="low">{dict.common.low}</option>
                  <option value="medium">{dict.common.medium}</option>
                  <option value="high">{dict.common.high}</option>
                  <option value="urgent">{dict.common.urgent}</option>
                </select>
                <select
                  name="assigneeId"
                  defaultValue={task.assignee_id ?? ""}
                  className="h-11 rounded-xl border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">{dict.common.unassigned}</option>
                  {members.map((member) => {
                    const profile = Array.isArray(member.user)
                      ? member.user[0]
                      : member.user;
                    return (
                      <option key={member.id} value={profile.id}>
                        {profile.full_name ?? profile.email}
                      </option>
                    );
                  })}
                </select>
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
