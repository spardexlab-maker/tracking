import { createClient } from "@/lib/supabase/server";

export async function getReports(workspaceId: string) {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, priority, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email), status:task_statuses!tasks_status_id_fkey(id, name, name_ar, is_done)",
    )
    .eq("workspace_id", workspaceId)
    .is("archived_at", null);

  const rows = tasks ?? [];
  const byStatus = new Map<string, number>();
  const byPriority = new Map<string, number>();
  const byAssignee = new Map<string, number>();

  for (const task of rows) {
    const status = Array.isArray(task.status) ? task.status[0] : task.status;
    const assignee = Array.isArray(task.assignee)
      ? task.assignee[0]
      : task.assignee;
    byStatus.set(status?.name ?? "Unknown", (byStatus.get(status?.name ?? "Unknown") ?? 0) + 1);
    byPriority.set(task.priority, (byPriority.get(task.priority) ?? 0) + 1);
    byAssignee.set(
      assignee?.full_name ?? assignee?.email ?? "Unassigned",
      (byAssignee.get(assignee?.full_name ?? assignee?.email ?? "Unassigned") ?? 0) + 1,
    );
  }

  return {
    totalTasks: rows.length,
    completedTasks: rows.filter((task) => {
      const status = Array.isArray(task.status) ? task.status[0] : task.status;
      return status?.is_done;
    }).length,
    byStatus: Array.from(byStatus.entries()),
    byPriority: Array.from(byPriority.entries()),
    byAssignee: Array.from(byAssignee.entries()),
  };
}

