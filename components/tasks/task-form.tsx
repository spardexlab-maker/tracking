import { createTaskAction } from "@/lib/actions/task";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function TaskForm({
  locale,
  dict,
  workspaceId,
  projectId,
  statuses,
  members,
}: {
  locale: Locale;
  dict: Dictionary;
  workspaceId: string;
  projectId: string;
  statuses: Array<{ id: string; name: string; name_ar: string }>;
  members: Array<{
    id: string;
    user:
      | { id: string; full_name: string | null; email: string }
      | Array<{ id: string; full_name: string | null; email: string }>;
  }>;
}) {
  const firstStatus = statuses[0];

  return (
    <form
      action={createTaskAction}
      className="grid gap-4 rounded-2xl border bg-card p-4 sm:p-5"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-2">
        <Label htmlFor="title">{dict.common.task}</Label>
        <Input id="title" name="title" required className="h-11" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{dict.common.description}</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{dict.common.status}</Label>
          <select
            name="statusId"
            defaultValue={firstStatus?.id}
            className="h-11 rounded-xl border bg-background px-3 text-sm"
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {locale === "ar" ? status.name_ar : status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label>{dict.common.priority}</Label>
          <Select name="priority" defaultValue="medium">
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{dict.common.assignee}</Label>
          <Select name="assigneeId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dict.common.unassigned} />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => {
                const user = Array.isArray(member.user)
                  ? member.user[0]
                  : member.user;
                return (
                  <SelectItem key={member.id} value={user.id}>
                    {user.full_name ?? user.email}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {dict.tasks.assignmentHint}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="attachment">{dict.common.attachments}</Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/*,.pdf"
          className="h-11"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {dict.tasks.createTaskPanelHint}
      </p>

      <SubmitButton className="h-11 w-full sm:w-fit" pendingText={dict.tasks.createTask}>
        {dict.tasks.createTask}
      </SubmitButton>
    </form>
  );
}
