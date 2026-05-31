import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    trend: 'text-muted-foreground',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-primary',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600',
    trend: 'text-emerald-600',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600',
    trend: 'text-amber-600',
  },
  destructive: {
    icon: 'bg-red-50 text-red-600',
    trend: 'text-red-600',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-card-foreground tabular-nums">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-2 flex items-center gap-1',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-muted-foreground">من الشهر الماضي</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
