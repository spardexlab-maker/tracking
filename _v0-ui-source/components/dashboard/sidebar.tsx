'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
  { name: 'المشاريع', href: '/projects', icon: FolderKanban },
  { name: 'كل المهام', href: '/tasks', icon: ListTodo },
  { name: 'التقويم', href: '/calendar', icon: Calendar },
  { name: 'التقارير', href: '/reports', icon: FileBarChart },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 h-screen bg-sidebar text-sidebar-foreground transition-sidebar z-40 flex flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-lg text-white truncate">مسار</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">
              إدارة المشاريع
            </span>
          </div>
        )}
      </div>

      {/* Workspace Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 mb-1">مساحة العمل</p>
          <p className="text-sm font-medium text-white truncate">
            شركة العزة للمقاولات العامة
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center m-3 p-2 rounded-lg border border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </aside>
  )
}
