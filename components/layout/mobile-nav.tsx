"use client";

import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  ClipboardCheck,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const items = [
  { href: "dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "tasks", icon: ListTodo, key: "myTasks" },
  { href: "approvals", icon: ClipboardCheck, key: "approvals" },
  { href: "employees", icon: Users, key: "employees" },
  { href: "calendar", icon: CalendarDays, key: "calendar" },
  { href: "reports", icon: BarChart3, key: "reports" },
  { href: "settings", icon: Settings, key: "settings" },
] as const;

export function MobileNav({
  locale,
  dict,
  workspaceName,
  role,
  counts,
}: {
  locale: Locale;
  dict: Dictionary;
  workspaceName: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  counts?: {
    myTasks: number;
    allTasks: number;
    pendingApproval: number;
  };
}) {
  const isLeader = ["owner", "admin", "manager"].includes(role);
  const visibleItems = isLeader
    ? items
    : items.filter(({ key }) =>
        ["dashboard", "myTasks", "calendar"].includes(key),
      );

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="lg:hidden" />
        }
      >
        <Menu className="size-5" />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="w-80 border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border pb-4 text-start">
          <SheetTitle className="text-sidebar-foreground">{dict.app.name}</SheetTitle>
          <p className="text-sm text-sidebar-foreground/70">{workspaceName}</p>
        </SheetHeader>
        <nav className="mt-6 grid gap-2">
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

            return (
              <Link
                key={href}
                href={`/${locale}/${href}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
      </SheetContent>
    </Sheet>
  );
}
