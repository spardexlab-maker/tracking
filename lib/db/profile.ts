import { createClient } from "@/lib/supabase/server";

export async function getProfileSettings(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_settings")
      .select("locale, theme")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    profile,
    settings,
  };
}
