import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceContext = {
  workspace: {
    id: string;
    name: string;
  };
  role: "owner" | "admin" | "manager" | "member" | "viewer";
};

type FastWorkspaceContextRow = {
  workspace_id: string;
  workspace_name: string;
  member_role: WorkspaceContext["role"];
};

export const getActiveWorkspaceContext = cache(async (
  userId: string,
): Promise<WorkspaceContext | null> => {
  const supabase = await createClient();

  const { data: fastContext, error: fastContextError } = await supabase
    .rpc("get_my_active_workspace_context")
    .maybeSingle();

  if (!fastContextError && fastContext) {
    const row = fastContext as FastWorkspaceContextRow;
    return {
      workspace: {
        id: row.workspace_id,
        name: row.workspace_name,
      },
      role: row.member_role,
    } as WorkspaceContext;
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", userId)
    .maybeSingle();

  let workspaceId = settings?.active_workspace_id ?? null;

  if (!workspaceId) {
    const { data: firstMembership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    workspaceId = firstMembership?.workspace_id ?? null;
  }

  if (!workspaceId) {
    return null;
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership?.workspace) {
    return null;
  }

  const workspace = Array.isArray(membership.workspace)
    ? membership.workspace[0]
    : membership.workspace;

  return {
    workspace,
    role: membership.role,
  } as WorkspaceContext;
});

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("id, role, user:profiles(id, full_name, email, avatar_url)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getPendingInvitations(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getOrCreateDefaultProject(
  workspaceId: string,
  userId: string,
): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name: "المشروع الرئيسي",
      created_by: userId,
      status: "active",
      priority: "medium",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Failed to create default project: " + (error?.message ?? "unknown"));
  }

  return created.id;
}
