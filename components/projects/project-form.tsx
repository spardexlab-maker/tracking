import { createProjectAction } from "@/lib/actions/project";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function ProjectForm({
  locale,
  dict,
  workspaceId,
}: {
  locale: Locale;
  dict: Dictionary;
  workspaceId: string;
}) {
  return (
    <form action={createProjectAction} className="grid gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="workspaceId" value={workspaceId} />

      <div className="grid gap-2">
        <Label htmlFor="name">{dict.common.name}</Label>
        <Input id="name" name="name" required className="h-11" />
      </div>

      <SubmitButton className="h-11 w-full sm:w-fit" pendingText={dict.projects.createProject}>
        {dict.projects.createProject}
      </SubmitButton>
    </form>
  );
}
