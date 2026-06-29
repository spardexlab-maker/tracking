import { createClient } from "@/lib/supabase/server";

const TASK_LIST_LIMIT = 100;
const PROJECT_TASK_LIMIT = 150;
const DETAIL_COLLECTION_LIMIT = 80;

export async function getTaskStatuses(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_statuses")
    .select("id, name, name_ar, color, position, is_done")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  return data ?? [];
}

export async function getTaskLabels(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_labels")
    .select("id, name, color")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  return data ?? [];
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, task_number, title, description, priority, start_date, due_date, archived_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)",
    )
    .eq("project_id", projectId)
    .is("archived_at", null)
    .order("task_number", { ascending: true })
    .limit(PROJECT_TASK_LIMIT);

  return data ?? [];
}

export async function getMyTasks(
  workspaceId: string,
  userId: string,
  filters?: { search?: string; priority?: string; hideCompleted?: boolean },
) {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(
      "id, task_number, title, description, priority, due_date, received_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, project:projects(id, name), status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done)",
    )
    .eq("workspace_id", workspaceId)
    .eq("assignee_id", userId)
    .is("archived_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(TASK_LIST_LIMIT);

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  const { data } = await query;

  const rows = data ?? [];
  return filters?.hideCompleted
    ? rows.filter((task) => {
        const status = Array.isArray(task.status) ? task.status[0] : task.status;
        return !status?.is_done;
      })
    : rows;
}

export async function getWorkspaceTasks(
  workspaceId: string,
  filters?: {
    search?: string;
    projectId?: string;
    hideCompleted?: boolean;
    pendingApproval?: boolean;
    awaitingPmSignOff?: boolean;
    unreceived?: boolean;
  },
) {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(
      "id, task_number, title, description, due_date, received_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, project:projects(id, name), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email), status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done)",
    )
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(TASK_LIST_LIMIT);

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  if (filters?.projectId) {
    query = query.eq("project_id", filters.projectId);
  }

  if (filters?.pendingApproval) {
    query = query
      .not("completion_requested_at", "is", null)
      .is("delivery_approved_at", null);
  }

  if (filters?.awaitingPmSignOff) {
    query = query
      .not("completion_requested_at", "is", null)
      .not("delivery_approved_at", "is", null)
      .not("transferred_to_pm_at", "is", null)
      .is("completion_approved_at", null);
  }

  if (filters?.unreceived) {
    query = query
      .is("received_at", null)
      .not("assignee_id", "is", null)
      .is("completion_approved_at", null);
  }

  const { data } = await query;
  const rows = data ?? [];
  return filters?.hideCompleted
    ? rows.filter((task) => {
        const status = Array.isArray(task.status) ? task.status[0] : task.status;
        return !status?.is_done;
      })
    : rows;
}

export async function getPendingApprovalTasks(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, task_number, title, description, due_date, received_at, completion_requested_at, delivery_approved_at, transferred_to_pm_at, completion_approved_at, project:projects(id, name), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email), status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done)",
    )
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .not("completion_requested_at", "is", null)
    .is("completion_approved_at", null)
    .order("completion_requested_at", { ascending: false });

  return data ?? [];
}

export async function getTask(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, workspace_id, project_id, task_number, title, description, priority, start_date, due_date, assignee_id, created_by, created_at, assigned_at, received_at, completion_requested_at, completion_requested_by, completion_requested_status_id, delivery_approved_at, delivery_approved_by, transferred_to_pm_at, transferred_to_pm_by, completion_approved_at, completion_approved_by, status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done), assignee:profiles!tasks_assignee_id_fkey(id, full_name, email), project:projects(id, name)",
    )
    .eq("id", taskId)
    .maybeSingle();

  return data;
}

export async function getTaskDetailCollections(taskId: string) {
  const supabase = await createClient();
  const [comments, attachments, activities, checklist, labels] = await Promise.all([
    supabase
      .from("task_comments")
      .select("id, body, created_at, author:profiles(id, full_name, email)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })
      .limit(DETAIL_COLLECTION_LIMIT),
    supabase
      .from("task_attachments")
      .select("id, file_name, mime_type, file_size, created_at, object_path")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
      .limit(DETAIL_COLLECTION_LIMIT),
    supabase
      .from("task_activities")
      .select("id, activity_type, payload, created_at, actor:profiles(id, full_name, email)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
      .limit(DETAIL_COLLECTION_LIMIT),
    supabase
      .from("task_checklist_items")
      .select("id, title, is_done, position")
      .eq("task_id", taskId)
      .order("position", { ascending: true })
      .limit(DETAIL_COLLECTION_LIMIT),
    supabase
      .from("task_label_assignments")
      .select("id, label:task_labels(id, name, color)")
      .eq("task_id", taskId)
      .limit(DETAIL_COLLECTION_LIMIT),
  ]);

  return {
    comments: comments.data ?? [],
    attachments: attachments.data ?? [],
    activities: activities.data ?? [],
    checklist: checklist.data ?? [],
    labels: labels.data ?? [],
  };
}

export async function getCalendarTasks(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(
      "id, task_number, title, start_date, due_date, project:projects(id, name), status:task_statuses!tasks_status_id_fkey(id, name, name_ar, color, is_done)",
    )
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .limit(250);

  return data ?? [];
}

export async function getTaskNavigationCounts(
  workspaceId: string,
  userId: string,
  role: "owner" | "admin" | "manager" | "member" | "viewer",
) {
  const supabase = await createClient();
  const isLeader = ["owner", "admin", "manager"].includes(role);

  const [myTasks, allTasks, pendingApproval] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("assignee_id", userId)
      .is("archived_at", null),
    isLeader
      ? supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .is("archived_at", null)
      : Promise.resolve({ count: null }),
    isLeader
      ? supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .not("completion_requested_at", "is", null)
          .is("completion_approved_at", null)
          .is("archived_at", null)
      : Promise.resolve({ count: null }),
  ]);

  return {
    myTasks: myTasks.count ?? 0,
    allTasks: allTasks.count ?? 0,
    pendingApproval: pendingApproval.count ?? 0,
  };
}

