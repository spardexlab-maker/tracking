"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Mark notifications as read when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setNotifications((current) => {
        const unreadIds = current.filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length > 0) {
          const supabase = createClient();
          void supabase
            .from("notifications")
            .update({ is_read: true })
            .in("id", unreadIds);

          return current.map((n) => (n.is_read ? n : { ...n, is_read: true }));
        }
        return current;
      });
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-start" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative size-8 inline-flex items-center justify-center rounded-lg border border-border/80 bg-card text-foreground shadow-sm hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none cursor-pointer"
        aria-label={label}
        aria-expanded={isOpen}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 origin-top-right rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground border-b border-border/50 text-start">
            {label}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-muted-foreground">—</p>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="border-b border-border/50 px-4 py-3.5 last:border-b-0 text-start hover:bg-muted/40 transition-colors">
                  <p className="text-sm font-medium leading-normal text-foreground">
                    {translations?.[item.type ?? ""] ?? item.title}
                  </p>
                  {item.body && (
                    <p className="mt-1 text-xs leading-normal text-muted-foreground">
                      {item.body}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
