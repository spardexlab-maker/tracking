"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

export async function updateLocaleAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const nextLocale = formData.get("nextLocale") === "en" ? "en" : "ar";
  const supabase = await createClient();

  await supabase
    .from("user_settings")
    .update({ locale: nextLocale })
    .eq("user_id", user.id);

  revalidatePath(`/${locale}/settings`);
  redirect(`/${nextLocale}/settings?saved=1`);
}

export async function updateProfileAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const fullName = String(formData.get("fullName") ?? "").trim();
  const theme =
    formData.get("theme") === "light" || formData.get("theme") === "dark"
      ? formData.get("theme")
      : "system";
  const nextLocale = formData.get("nextLocale") === "en" ? "en" : "ar";
  const supabase = await createClient();

  await Promise.all([
    supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id),
    supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    }),
    supabase
      .from("user_settings")
      .update({ locale: nextLocale, theme })
      .eq("user_id", user.id),
  ]);

  revalidatePath(`/${locale}/settings`);
  redirect(`/${nextLocale}/settings?saved=1`);
}
