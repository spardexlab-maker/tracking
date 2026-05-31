import { createClient } from "@/lib/supabase/server";

export async function getProjects(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, archived_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProject(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, workspace_id, name, archived_at")
    .eq("id", projectId)
    .maybeSingle();

  return data;
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("id, user:profiles(id, full_name, email)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return data ?? [];
}
