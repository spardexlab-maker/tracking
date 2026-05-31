"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { projectMemberSchema } from "@/lib/validations/project-member";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

export async function addProjectMemberAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const parsed = projectMemberSchema.safeParse({
    projectId: formData.get("projectId"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase.from("project_members").upsert(
    {
      project_id: parsed.data.projectId,
      user_id: parsed.data.userId,
    },
    { onConflict: "project_id,user_id" },
  );

  revalidatePath(`/${locale}/projects/${parsed.data.projectId}`);
  redirect(`/${locale}/projects/${parsed.data.projectId}?saved=1`);
}

export async function removeProjectMemberAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const memberId = String(formData.get("memberId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  const supabase = await createClient();
  await supabase.from("project_members").delete().eq("id", memberId);

  revalidatePath(`/${locale}/projects/${projectId}`);
  redirect(`/${locale}/projects/${projectId}?saved=1`);
}
