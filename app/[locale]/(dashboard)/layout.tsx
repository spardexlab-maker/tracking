import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signOutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getTaskNavigationCounts } from "@/lib/db/tasks";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationCenter } from "@/components/layout/notification-center";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const headerStore = await headers();
  const currentPath = headerStore.get("x-pathname") ?? undefined;
  const currentLocalePath =
    currentPath?.split("/").filter(Boolean).slice(1).join("/") || "dashboard";

  if (!context) {
    redirect(`/${locale}/onboarding`);
  }

  const dict = getDictionary(locale);
  const navigationCounts = await getTaskNavigationCounts(
    context.workspace.id,
    user.id,
    context.role,
  );
  const supabase = await createClient();

  const isLeader = ["owner", "admin", "manager"].includes(context.role);
  let sidebarQuery = supabase
    .from("tasks")
    .select(
      "id, title, task_number, status:task_statuses!tasks_status_id_fkey!inner(is_done)",
    )
    .eq("workspace_id", context.workspace.id)
    .eq("status.is_done", false)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!isLeader) {
    sidebarQuery = sidebarQuery.eq("assignee_id", user.id);
  }

  const { data: activeTasksRaw } = await sidebarQuery;
  const activeTasks = ((activeTasksRaw ?? []) as unknown as { id: string; title: string; task_number: number }[]).map((t) => ({
    id: t.id,
    title: t.title,
    task_number: t.task_number,
  }));

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar
        locale={locale}
        dict={dict}
        currentPath={currentPath}
        workspaceName={context.workspace.name}
        role={context.role}
        counts={navigationCounts}
        activeTasks={activeTasks}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileNav
                locale={locale}
                dict={dict}
                workspaceName={context.workspace.name}
                role={context.role}
                counts={navigationCounts}
              />
              <div>
                <p className="text-base font-semibold">{dict.app.name}</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {context.workspace.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher locale={locale} path={currentLocalePath} />
              <NotificationCenter
                userId={user.id}
                initialNotifications={notifications ?? []}
                label={dict.common.notifications}
                translations={dict.notificationTypes}
              />
              <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <Button variant="outline" size="sm" className="bg-card shadow-sm">
                  {dict.common.signOut}
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
