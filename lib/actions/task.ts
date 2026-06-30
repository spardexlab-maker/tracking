"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checklistItemSchema,
  commentSchema,
  labelSchema,
  taskProgressSchema,
  taskSchema,
} from "@/lib/validations/task";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

function nullable(value?: string) {
  return value ? value : null;
}

export async function createTaskAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    statusId: formData.get("statusId"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
    startDate: formData.get("startDate") ?? "",
    dueDate: formData.get("dueDate") ?? "",
  });

  if (!parsed.success || !workspaceId) {
    console.error("TASK_VALIDATION_FAILURE:", {
      success: parsed.success,
      errors: parsed.success ? null : parsed.error.flatten().fieldErrors,
      workspaceId,
      formData: {
        projectId: formData.get("projectId"),
        title: formData.get("title"),
        description: formData.get("description"),
        statusId: formData.get("statusId"),
        priority: formData.get("priority"),
        assigneeId: formData.get("assigneeId"),
        startDate: formData.get("startDate"),
        dueDate: formData.get("dueDate"),
      }
    });
    redirect(`/${locale}/tasks?error=task`);
  }

  if (parsed.data.assigneeId) {
    const adminClient = createAdminClient();
    await adminClient.from("project_members").upsert(
      {
        project_id: parsed.data.projectId,
        user_id: parsed.data.assigneeId,
      },
      { onConflict: "project_id,user_id" },
    );
  }

  const supabase = await createClient();
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      project_id: parsed.data.projectId,
      status_id: parsed.data.statusId,
      task_number: 0,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      assignee_id: nullable(parsed.data.assigneeId),
      start_date: nullable(parsed.data.startDate),
      due_date: nullable(parsed.data.dueDate),
      created_by: user.id,
      updated_by: user.id,
      received_at: parsed.data.assigneeId === user.id ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/${locale}/tasks?error=task`);
  }

  const attachment = formData.get("attachment");
  if (task && attachment instanceof File && attachment.size > 0) {
    const objectPath = `${workspaceId}/${task.id}/${crypto.randomUUID()}-${attachment.name}`;
    const fileBuffer = Buffer.from(await attachment.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("task-attachments")
      .upload(objectPath, fileBuffer, {
        contentType: attachment.type || undefined,
        upsert: false,
      });

    if (!uploadError) {
      const adminClient = createAdminClient();
      const { error: dbError } = await adminClient.from("task_attachments").insert({
        task_id: task.id,
        workspace_id: workspaceId,
        uploaded_by: user.id,
        object_path: objectPath,
        file_name: attachment.name,
        mime_type: attachment.type || null,
        file_size: attachment.size,
      });
      if (dbError) {
        console.error("SERVER_SIDE_ATTACHMENT_INSERT_FAILURE:", dbError);
      }
    } else {
      console.error("SERVER_SIDE_ATTACHMENT_UPLOAD_FAILURE:", uploadError);
    }
  }

  // Notify leaders of employee self-assigned tasks
  if (task && parsed.data.assigneeId === user.id) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    const isLeader = ["owner", "admin", "manager"].includes(member?.role || "");
    if (!isLeader) {
      const { data: leaders } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceId)
        .in("role", ["owner", "admin", "manager"]);

      if (leaders && leaders.length > 0) {
        const fullName = user.user_metadata?.full_name || user.email || "";
        const adminClient = createAdminClient();
        const notificationInserts = leaders.map((leader) => ({
          workspace_id: workspaceId,
          user_id: leader.user_id,
          actor_id: user.id,
          task_id: task.id,
          type: "task_self_assigned",
          title: locale === "ar" ? "مهمة ذاتية جديدة" : "New Self-Assigned Task",
          body:
            locale === "ar"
              ? `قام الموظف ${fullName} بإضافة مهمة لنفسه: ${parsed.data.title}`
              : `Employee ${fullName} added a task for themselves: ${parsed.data.title}`,
        }));
        await adminClient.from("notifications").insert(notificationInserts);
      }
    }
  }

  revalidatePath(`/${locale}/tasks`);
  revalidatePath(`/${locale}/tasks/${task.id}`);
  revalidatePath(`/${locale}/projects/${parsed.data.projectId}`);
  redirect(`/${locale}/tasks/${task.id}?task-created=1`);
}

export async function updateTaskAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    statusId: formData.get("statusId"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success || !taskId) return;

  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status_id: parsed.data.statusId,
      priority: parsed.data.priority,
      assignee_id: nullable(parsed.data.assigneeId),
      start_date: nullable(parsed.data.startDate),
      due_date: nullable(parsed.data.dueDate),
      updated_by: user.id,
    })
    .eq("id", taskId);

  if (parsed.data.assigneeId) {
    const adminClient = createAdminClient();
    await adminClient.from("project_members").upsert(
      {
        project_id: parsed.data.projectId,
        user_id: parsed.data.assigneeId,
      },
      { onConflict: "project_id,user_id" },
    );
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
  redirect(`/${locale}/tasks/${taskId}?saved=1`);
}

export async function archiveTaskAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const supabase = await createClient();

  await supabase
    .from("tasks")
    .update({ archived_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", taskId);

  revalidatePath(`/${locale}/tasks`);
  redirect(`/${locale}/tasks`);
}

export async function deleteTaskAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const supabase = await createClient();

  await supabase.from("tasks").delete().eq("id", taskId);

  revalidatePath(`/${locale}/tasks`);
  if (projectId) {
    revalidatePath(`/${locale}/projects/${projectId}`);
  }
  redirect(`/${locale}/tasks`);
}

export async function updateTaskStatusAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const statusId = String(formData.get("statusId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const supabase = await createClient();

  await supabase
    .from("tasks")
    .update({ status_id: statusId, updated_by: user.id })
    .eq("id", taskId);

  revalidatePath(`/${locale}/projects/${projectId}`);
}

export async function updateTaskProgressAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = taskProgressSchema.safeParse({
    taskId: formData.get("taskId"),
    statusId: formData.get("statusId"),
    note: formData.get("note"),
  });
  const projectId = String(formData.get("projectId") ?? "");

  if (!parsed.success) {
    redirect(`/${locale}/tasks/${String(formData.get("taskId") ?? "")}?error=progress`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_assigned_task_progress", {
    target_task_id: parsed.data.taskId,
    target_status_id: parsed.data.statusId,
    note_body: parsed.data.note || null,
  });

  if (error) {
    redirect(`/${locale}/tasks/${parsed.data.taskId}?error=progress`);
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select("title, workspace_id, created_by, assignee_id, completion_requested_at")
    .eq("id", parsed.data.taskId)
    .single();

  if (task && task.completion_requested_at && task.created_by && task.created_by !== user.id) {
    const fullName = user.user_metadata?.full_name || user.email || "";
    await admin.from("notifications").insert({
      workspace_id: task.workspace_id,
      user_id: task.created_by,
      actor_id: user.id,
      task_id: parsed.data.taskId,
      type: "task_admin_approved",
      title: locale === "ar" ? "طلب اعتماد اكتمال" : "Completion Approval Requested",
      body:
        locale === "ar"
          ? `قام الموظف ${fullName} بطلب اعتماد اكتمال المهمة: ${task.title}`
          : `Employee ${fullName} has requested completion approval for: ${task.title}`,
    });
  }

  revalidatePath(`/${locale}/tasks/${parsed.data.taskId}`);
  if (projectId) {
    revalidatePath(`/${locale}/projects/${projectId}`);
  }
  redirect(`/${locale}/tasks/${parsed.data.taskId}?progress-updated=1`);
}

export async function approveTaskDeliveryAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("approve_task_delivery", {
    target_task_id: taskId,
  });

  if (error) {
    redirect(`/${locale}/tasks/${taskId}?error=delivery-approval-failed`);
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select("title, workspace_id, assignee_id")
    .eq("id", taskId)
    .single();

  if (task) {
    await admin.from("task_activities").insert({
      task_id: taskId,
      workspace_id: task.workspace_id,
      actor_id: user.id,
      activity_type: "task_delivery_approved",
      payload: { title: task.title },
    });

    if (task.assignee_id) {
      await admin.from("notifications").insert({
        workspace_id: task.workspace_id,
        user_id: task.assignee_id,
        actor_id: user.id,
        task_id: taskId,
        type: "task_delivery_approved",
        title: locale === "ar" ? "تم اعتماد تسليم المهمة" : "Task delivery approved",
        body:
          locale === "ar"
            ? `تم اعتماد تسليم مهمتك "${task.title}" من قبل المسؤول.`
            : `Your task delivery for "${task.title}" has been approved by admin.`,
      });
    }
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
  revalidatePath(`/${locale}/approvals`);
  if (projectId) {
    revalidatePath(`/${locale}/projects/${projectId}`);
  }
  if (returnTo) {
    redirect(returnTo);
  }
  redirect(`/${locale}/tasks/${taskId}?saved=1`);
}

export async function transferTaskToPmAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("transfer_task_to_pm", {
    target_task_id: taskId,
  });

  if (error) {
    redirect(`/${locale}/tasks/${taskId}?error=transfer-pm-failed`);
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select("title, workspace_id, assignee_id")
    .eq("id", taskId)
    .single();

  if (task) {
    await admin.from("task_activities").insert({
      task_id: taskId,
      workspace_id: task.workspace_id,
      actor_id: user.id,
      activity_type: "task_transferred_to_pm",
      payload: { title: task.title },
    });

    if (task.assignee_id) {
      await admin.from("notifications").insert({
        workspace_id: task.workspace_id,
        user_id: task.assignee_id,
        actor_id: user.id,
        task_id: taskId,
        type: "task_transferred_to_pm",
        title: locale === "ar" ? "تم تحويل المهمة لمدير المشاريع" : "Task transferred to PM",
        body:
          locale === "ar"
            ? `تم تحويل مهمتك "${task.title}" إلى مدير المشاريع وهي بانتظار الهامش.`
            : `Your task "${task.title}" has been transferred to PM and is awaiting sign-off margin.`,
      });
    }
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
  revalidatePath(`/${locale}/approvals`);
  if (projectId) {
    revalidatePath(`/${locale}/projects/${projectId}`);
  }
  if (returnTo) {
    redirect(returnTo);
  }
  redirect(`/${locale}/tasks/${taskId}?saved=1`);
}

export async function approveTaskCompletionAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("approve_task_completion", {
    target_task_id: taskId,
  });

  if (error) {
    redirect(`/${locale}/tasks/${taskId}?error=completion-approval-failed`);
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select("title, workspace_id, assignee_id")
    .eq("id", taskId)
    .single();

  if (task) {
    await admin.from("task_activities").insert({
      task_id: taskId,
      workspace_id: task.workspace_id,
      actor_id: user.id,
      activity_type: "task_completed",
      payload: { title: task.title },
    });

    if (task.assignee_id) {
      await admin.from("notifications").insert({
        workspace_id: task.workspace_id,
        user_id: task.assignee_id,
        actor_id: user.id,
        task_id: taskId,
        type: "task_completed",
        title: locale === "ar" ? "تم إكمال المهمة نهائياً" : "Task completed with final approval",
        body:
          locale === "ar"
            ? `تمت الموافقة النهائية واعتماد اكتمال مهمتك: ${task.title}`
            : `Task "${task.title}" has been marked completed with final approval.`,
      });
    }
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
  revalidatePath(`/${locale}/approvals`);
  if (projectId) {
    revalidatePath(`/${locale}/projects/${projectId}`);
  }
  if (returnTo) {
    redirect(returnTo);
  }
  redirect(`/${locale}/tasks/${taskId}?saved=1`);
}

export async function receiveTaskAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");

  if (!taskId) return;

  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("id, title, workspace_id, created_by, assignee_id")
    .eq("id", taskId)
    .single();

  if (!task) return;

  if (task.assignee_id !== user.id) {
    redirect(`/${locale}/tasks/${taskId}?error=not-assignee`);
  }

  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("tasks")
    .update({
      received_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", taskId);

  if (updateError) {
    redirect(`/${locale}/tasks/${taskId}?error=receive-failed`);
  }

  await admin.from("task_activities").insert({
    task_id: taskId,
    workspace_id: task.workspace_id,
    actor_id: user.id,
    activity_type: "task_received",
    payload: { title: task.title },
  });

  if (task.created_by && task.created_by !== user.id) {
    const fullName = user.user_metadata?.full_name || user.email || "";
    await admin.from("notifications").insert({
      workspace_id: task.workspace_id,
      user_id: task.created_by,
      actor_id: user.id,
      task_id: taskId,
      type: "task_received",
      title: locale === "ar" ? "تم استلام المهمة" : "Task received",
      body:
        locale === "ar"
          ? `قام الموظف ${fullName} باستلام المهمة: ${task.title}`
          : `Employee ${fullName} has received the task: ${task.title}`,
    });
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
  redirect(`/${locale}/tasks/${taskId}?saved=1`);
}

export async function addCommentAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = commentSchema.safeParse({
    taskId: formData.get("taskId"),
    body: formData.get("body"),
  });
  const workspaceId = String(formData.get("workspaceId") ?? "");

  if (!parsed.success || !workspaceId) {
    redirect(`/${locale}/tasks/${String(formData.get("taskId") ?? "")}?error=comment`);
  }

  const supabase = await createClient();
  await supabase.from("task_comments").insert({
    task_id: parsed.data.taskId,
    workspace_id: workspaceId,
    author_id: user.id,
    body: parsed.data.body,
  });

  revalidatePath(`/${locale}/tasks/${parsed.data.taskId}`);
  redirect(`/${locale}/tasks/${parsed.data.taskId}?comment-added=1`);
}

export async function addChecklistItemAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = checklistItemSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
  });
  const workspaceId = String(formData.get("workspaceId") ?? "");

  if (!parsed.success || !workspaceId) {
    redirect(`/${locale}/tasks/${String(formData.get("taskId") ?? "")}?error=checklist`);
  }

  const supabase = await createClient();
  await supabase.from("task_checklist_items").insert({
    task_id: parsed.data.taskId,
    workspace_id: workspaceId,
    title: parsed.data.title,
    created_by: user.id,
  });

  revalidatePath(`/${locale}/tasks/${parsed.data.taskId}`);
}

export async function toggleChecklistItemAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const isDone = String(formData.get("isDone")) !== "true";
  const supabase = await createClient();

  await supabase
    .from("task_checklist_items")
    .update({ is_done: isDone })
    .eq("id", itemId);

  revalidatePath(`/${locale}/tasks/${taskId}`);
}

export async function createLabelAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = labelSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    color: formData.get("color"),
  });
  const taskId = String(formData.get("taskId") ?? "");

  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: label } = await supabase
    .from("task_labels")
    .upsert(
      {
        workspace_id: parsed.data.workspaceId,
        name: parsed.data.name,
        color: parsed.data.color,
        created_by: user.id,
      },
      { onConflict: "workspace_id,name" },
    )
    .select("id")
    .single();

  if (label && taskId) {
    await supabase.from("task_label_assignments").upsert(
      {
        task_id: taskId,
        label_id: label.id,
      },
      { onConflict: "task_id,label_id" },
    );
  }

  revalidatePath(`/${locale}/tasks/${taskId}`);
}

export async function assignLabelAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const taskId = String(formData.get("taskId") ?? "");
  const labelId = String(formData.get("labelId") ?? "");
  const supabase = await createClient();

  await supabase.from("task_label_assignments").upsert(
    {
      task_id: taskId,
      label_id: labelId,
    },
    { onConflict: "task_id,label_id" },
  );

  revalidatePath(`/${locale}/tasks/${taskId}`);
}

export async function removeLabelAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const supabase = await createClient();

  await supabase.from("task_label_assignments").delete().eq("id", assignmentId);
  revalidatePath(`/${locale}/tasks/${taskId}`);
}
