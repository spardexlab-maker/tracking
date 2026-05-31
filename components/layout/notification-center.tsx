"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  type?: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationCenter({
  userId,
  initialNotifications,
  label,
  translations,
}: {
  userId: string;
  initialNotifications: NotificationItem[];
  label: string;
  translations: Record<string, string>;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [
            payload.new as NotificationItem,
            ...current,
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative border-border/80 bg-card shadow-sm"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">—</p>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="border-b px-2 py-3 last:border-b-0">
                <p className="text-sm font-medium">
                  {translations[item.type ?? ""] ?? item.title}
                </p>
                {item.body && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.body}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
