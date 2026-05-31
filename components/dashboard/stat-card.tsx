import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatVariant = "default" | "primary" | "success" | "warning" | "destructive";

const variantStyles: Record<StatVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-blue-50 text-primary",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  destructive: "bg-red-50 text-red-700",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: StatVariant;
}) {
  return (
    <div className="enterprise-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        </div>
        <span className={cn("rounded-2xl p-3", variantStyles[variant])}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

