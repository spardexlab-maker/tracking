import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "secondary";

const variantStyles: Record<StatusBadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  destructive: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  secondary: "bg-slate-100 text-slate-600",
};

export function StatusBadge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

