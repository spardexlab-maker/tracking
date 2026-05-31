import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser(locale: Locale) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  return user;
}
