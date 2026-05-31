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
    totalTasks,
    unreceivedTasks,
    remainingTasks,
    completedTasks,
    tasks,
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("received_at", null)
      .eq("status.is_done", false)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .not("received_at", "is", null)
      .eq("status.is_done", false)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .eq("status.is_done", true)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select(
        "id, task_number, title, priority, due_date, received_at, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)",
      )
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_activities")
      .select("id, activity_type, payload, created_at, task:tasks(id, title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rawTasks = (tasks.data ?? []) as unknown as RawDbTask[];

  return {
    totalTasks: totalTasks.count ?? 0,
    unreceivedTasks: unreceivedTasks.count ?? 0,
    remainingTasks: remainingTasks.count ?? 0,
    completedTasks: completedTasks.count ?? 0,
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
    totalTasks,
    unreceivedTasks,
    remainingTasks,
    completedTasks,
    tasks,
    recentActivity,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .is("received_at", null)
      .eq("status.is_done", false)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .not("received_at", "is", null)
      .eq("status.is_done", false)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select("id, status:task_statuses!tasks_status_id_fkey!inner(is_done)", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId)
      .eq("status.is_done", true)
      .is("archived_at", null),
    supabase
      .from("tasks")
      .select(
        "id, task_number, title, priority, due_date, received_at, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)",
      )
      .eq("workspace_id", workspaceId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_activities")
      .select("id, activity_type, payload, created_at, task:tasks(id, title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rawTasks = (tasks.data ?? []) as unknown as RawDbTask[];

  return {
    totalTasks: totalTasks.count ?? 0,
    unreceivedTasks: unreceivedTasks.count ?? 0,
    remainingTasks: remainingTasks.count ?? 0,
    completedTasks: completedTasks.count ?? 0,
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

