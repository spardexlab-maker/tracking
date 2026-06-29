import { createClient } from "@/lib/supabase/server";

type DashboardRpcActivity = {
  id: string;
  activity_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  task: { id: string; title: string } | null;
};

interface RawDbStatus {
  id: string;
  name: string;
  name_ar: string;
  color: string;
  is_done: boolean;
}

interface RawDbAssignee {
  id: string;
  full_name: string | null;
  email: string;
}

interface RawDbTask {
  id: string;
  task_number: number;
  title: string;
  priority: string;
  due_date: string | null;
  received_at: string | null;
  completion_requested_at: string | null;
  delivery_approved_at: string | null;
  transferred_to_pm_at: string | null;
  completion_approved_at: string | null;
  status: RawDbStatus | RawDbStatus[] | null;
  assignee: RawDbAssignee | RawDbAssignee[] | null;
}

interface RawDbActivity {
  id: string;
  activity_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  task: { id: string; title: string } | { id: string; title: string }[] | null;
}

export type TaskDashboardMetrics = {
  totalTasks: number;
  unreceivedTasks: number;
  remainingTasks: number;
  completedTasks: number;
  tasks: Array<{
    id: string;
    task_number: number;
    title: string;
    priority: string;
    due_date: string | null;
    received_at: string | null;
    completion_requested_at: string | null;
    delivery_approved_at: string | null;
    transferred_to_pm_at: string | null;
    completion_approved_at: string | null;
    status: {
      id: string;
      name: string;
      name_ar: string;
      color: string;
      is_done: boolean;
    } | null;
    assignee: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  }>;
  recentActivity: DashboardRpcActivity[];
};

export async function getEmployeeDashboardMetrics(
  workspaceId: string,
  userId: string,
): Promise<TaskDashboardMetrics> {
  const supabase = await createClient();

  const [
    summaryTasks,
    tasks,
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, received_at, status:task_statuses!tasks_status_id_fkey(is_done)")
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select(
        "id, task_number, title, priority, due_date, received_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)",
      )
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("archived_at", null)
      .is("completion_approved_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_activities")
      .select("id, activity_type, payload, created_at, task:tasks(id, title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rawTasks = (tasks.data ?? []) as unknown as RawDbTask[];
  const summary = (summaryTasks.data ?? []) as Array<{
    id: string;
    received_at: string | null;
    status: { is_done: boolean } | { is_done: boolean }[] | null;
  }>;

  const totalTasksCount = summary.length;
  let unreceivedTasksCount = 0;
  let remainingTasksCount = 0;
  let completedTasksCount = 0;

  for (const t of summary) {
    const s = Array.isArray(t.status) ? t.status[0] : t.status;
    const isDone = s?.is_done ?? false;
    if (isDone) {
      completedTasksCount++;
    } else {
      remainingTasksCount++;
      if (!t.received_at) {
        unreceivedTasksCount++;
      }
    }
  }

  return {
    totalTasks: totalTasksCount,
    unreceivedTasks: unreceivedTasksCount,
    remainingTasks: remainingTasksCount,
    completedTasks: completedTasksCount,
    tasks: rawTasks.map((t) => ({
      ...t,
      status: Array.isArray(t.status) ? t.status[0] : t.status,
      assignee: Array.isArray(t.assignee) ? t.assignee[0] : t.assignee,
    })),
    recentActivity: ((recentActivity.data ?? []) as unknown as RawDbActivity[]).map((act) => {
      const task = Array.isArray(act.task) ? act.task[0] : act.task;
      return {
        id: act.id,
        activity_type: act.activity_type,
        payload: act.payload,
        created_at: act.created_at,
        task: task ? { id: task.id, title: task.title } : null,
      };
    }),
  };
}

export async function getAdminDashboardMetrics(
  workspaceId: string,
): Promise<TaskDashboardMetrics> {
  const supabase = await createClient();

  const [
    summaryTasks,
    tasks,
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, received_at, status:task_statuses!tasks_status_id_fkey(is_done)")
      .eq("workspace_id", workspaceId)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select(
        "id, task_number, title, priority, due_date, received_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)",
      )
      .eq("workspace_id", workspaceId)
      .is("archived_at", null)
      .is("completion_approved_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_activities")
      .select("id, activity_type, payload, created_at, task:tasks(id, title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rawTasks = (tasks.data ?? []) as unknown as RawDbTask[];
  const summary = (summaryTasks.data ?? []) as Array<{
    id: string;
    received_at: string | null;
    status: { is_done: boolean } | { is_done: boolean }[] | null;
  }>;

  const totalTasksCount = summary.length;
  let unreceivedTasksCount = 0;
  let remainingTasksCount = 0;
  let completedTasksCount = 0;

  for (const t of summary) {
    const s = Array.isArray(t.status) ? t.status[0] : t.status;
    const isDone = s?.is_done ?? false;
    if (isDone) {
      completedTasksCount++;
    } else {
      remainingTasksCount++;
      if (!t.received_at) {
        unreceivedTasksCount++;
      }
    }
  }

  return {
    totalTasks: totalTasksCount,
    unreceivedTasks: unreceivedTasksCount,
    remainingTasks: remainingTasksCount,
    completedTasks: completedTasksCount,
    tasks: rawTasks.map((t) => ({
      ...t,
      status: Array.isArray(t.status) ? t.status[0] : t.status,
      assignee: Array.isArray(t.assignee) ? t.assignee[0] : t.assignee,
    })),
    recentActivity: ((recentActivity.data ?? []) as unknown as RawDbActivity[]).map((act) => {
      const task = Array.isArray(act.task) ? act.task[0] : act.task;
      return {
        id: act.id,
        activity_type: act.activity_type,
        payload: act.payload,
        created_at: act.created_at,
        task: task ? { id: task.id, title: task.title } : null,
      };
    }),
  };
}

