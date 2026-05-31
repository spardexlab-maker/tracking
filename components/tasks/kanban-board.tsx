import Link from "next/link";
import { updateTaskStatusAction } from "@/lib/actions/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Status = {
  id: string;
  name: string;
  name_ar: string;
  color: string;
};

type Task = {
  id: string;
  task_number: number;
  title: string;
  priority: string;
  status:
    | { id: string; name: string; name_ar: string; color: string }
    | Array<{ id: string; name: string; name_ar: string; color: string }>;
};

export function KanbanBoard({
  locale,
  dict,
  projectId,
  statuses,
  tasks,
  allowQuickStatusChange = true,
}: {
  locale: Locale;
  dict: Dictionary;
  projectId: string;
  statuses: Status[];
  tasks: Task[];
  allowQuickStatusChange?: boolean;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[720px] gap-4 md:grid-cols-3">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((task) => {
            const taskStatus = Array.isArray(task.status)
              ? task.status[0]
              : task.status;
            return taskStatus?.id === status.id;
          });

          return (
            <Card key={status.id} className="min-h-72 py-0">
              <CardHeader className="border-b py-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{locale === "ar" ? status.name_ar : status.name}</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {columnTasks.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 py-4">
                {columnTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border bg-background p-3 shadow-sm">
                    <Link
                      href={`/${locale}/tasks/${task.id}`}
                      className="font-medium hover:underline"
                    >
                      #{task.task_number} {task.title}
                    </Link>
                    {allowQuickStatusChange && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {statuses
                          .filter((candidate) => candidate.id !== status.id)
                          .slice(0, 2)
                          .map((candidate) => (
                            <form key={candidate.id} action={updateTaskStatusAction}>
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="taskId" value={task.id} />
                              <input type="hidden" name="projectId" value={projectId} />
                              <input type="hidden" name="statusId" value={candidate.id} />
                              <Button size="sm" variant="outline">
                                {locale === "ar"
                                  ? candidate.name_ar
                                  : candidate.name}
                              </Button>
                            </form>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {dict.tasks.emptyState}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
