"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

export async function createProjectAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success || !workspaceId) {
    redirect(`/${locale}/projects?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    workspace_id: workspaceId,
    name: parsed.data.name,
    created_by: user.id,
  });

  if (error) {
    redirect(`/${locale}/projects?error=create`);
  }

  revalidatePath(`/${locale}/projects`);
  redirect(`/${locale}/projects?created=1`);
}

export async function updateProjectAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success || !projectId) return;

  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
    })
    .eq("id", projectId);

  revalidatePath(`/${locale}/projects/${projectId}`);
  redirect(`/${locale}/projects/${projectId}?saved=1`);
}

export async function archiveProjectAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const projectId = String(formData.get("projectId") ?? "");
  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", projectId);

  revalidatePath(`/${locale}/projects`);
  redirect(`/${locale}/projects`);
}
