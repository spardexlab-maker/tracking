import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  ClipboardCheck,
  Settings,
  Users,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { WorkspaceLogo } from "@/components/workspace/workspace-logo";

const items = [
  { href: "dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "tasks", icon: ListTodo, key: "myTasks" },
  { href: "approvals", icon: ClipboardCheck, key: "approvals" },
  { href: "employees", icon: Users, key: "employees" },
  { href: "calendar", icon: CalendarDays, key: "calendar" },
  { href: "reports", icon: BarChart3, key: "reports" },
  { href: "settings", icon: Settings, key: "settings" },
] as const;

export function Sidebar({
  locale,
  dict,
  currentPath,
  workspaceName,
  workspaceId,
  role,
  counts,
  activeTasks,
}: {
  locale: Locale;
  dict: Dictionary;
  currentPath?: string;
  workspaceName: string;
  workspaceId: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  counts?: {
    myTasks: number;
    allTasks: number;
    pendingApproval: number;
  };
  activeTasks?: Array<{ id: string; title: string; task_number: number }>;
}) {
  const isLeader = ["owner", "admin", "manager"].includes(role);
  const visibleItems = isLeader
    ? items
    : items.filter(({ key }) =>
        ["dashboard", "myTasks", "calendar"].includes(key),
      );

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-e border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-8 border-b border-sidebar-border pb-5">
          <div className="flex items-center gap-3">
            <WorkspaceLogo
              workspaceId={workspaceId}
              fallbackText={locale === "ar" ? "م" : "M"}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
            <div className="min-w-0">
              <p className="text-lg font-semibold">{dict.app.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">{workspaceName}</p>
            </div>
          </div>
        </div>

        <div className="mb-3 px-3 text-[11px] font-semibold tracking-wide text-sidebar-foreground/55">
          {dict.navigation.overview}
        </div>

        <nav className="space-y-1.5">
          {visibleItems.map(({ href, icon: Icon, key }) => {
            const label =
              key === "myTasks"
                ? isLeader
                  ? dict.navigation.allTasks
                  : dict.navigation.myTasks
                : key === "calendar"
                  ? dict.navigation[key]
                  : key === "approvals"
                    ? dict.navigation.approvals
                  : key === "employees"
                    ? dict.navigation.employees
                  : dict.common[key as keyof typeof dict.common];
            const active = currentPath?.includes(`/${href}`);

            return (
              <Link
                key={href}
                href={`/${locale}/${href}`}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-border"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{label}</span>
                {key === "myTasks" && counts ? (
                  <span className="rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-[11px] text-sidebar-foreground">
                    {isLeader ? counts.allTasks : counts.myTasks}
                  </span>
                ) : null}
                {key === "approvals" && isLeader && counts?.pendingApproval ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-200">
                    {counts.pendingApproval}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {activeTasks && activeTasks.length > 0 && (
          <div className="mt-6 flex-1 overflow-y-auto">
            <div className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-sidebar-foreground/55">
              {locale === "ar" ? "المهام النشطة" : "Active Tasks"}
            </div>
            <div className="space-y-1">
              {activeTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/${locale}/tasks/${t.id}`}
                  className="block truncate rounded-xl px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  title={t.title}
                >
                  #{t.task_number} {t.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
          <p className="text-xs text-sidebar-foreground/60">{dict.common.workspace}</p>
          <p className="mt-1 truncate text-sm font-medium">{workspaceName}</p>
        </div>
      </div>
    </aside>
  );
}
