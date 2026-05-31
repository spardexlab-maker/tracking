'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  FolderKanban,
  MoreVertical,
  Calendar,
  Users,
  Trash2,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Sample data
const projects = [
  {
    id: 1,
    name: 'مستشفى كربلاء',
    description: 'مشروع بناء وتجهيز المستشفى الجديد في محافظة كربلاء',
    tasksCount: 8,
    completedTasks: 5,
    members: 4,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 2,
    name: 'مشروع الصيانة الدورية',
    description: 'أعمال الصيانة الدورية للمباني الحكومية',
    tasksCount: 12,
    completedTasks: 10,
    members: 6,
    status: 'active',
    createdAt: '2026-02-20',
  },
  {
    id: 3,
    name: 'تطوير البنية التحتية',
    description: 'تحديث وتطوير البنية التحتية للمنطقة الصناعية',
    tasksCount: 4,
    completedTasks: 4,
    members: 3,
    status: 'completed',
    createdAt: '2025-11-10',
  },
  {
    id: 4,
    name: 'تجريبي',
    description: 'مشروع تجريبي للاختبار',
    tasksCount: 2,
    completedTasks: 0,
    members: 1,
    status: 'active',
    createdAt: '2026-05-01',
  },
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredProjects = projects.filter((project) =>
    project.name.includes(searchQuery) || project.description.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المشاريع</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع المشاريع</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إنشاء مشروع
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مشروع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المشروع</Label>
                <Input id="name" placeholder="أدخل اسم المشروع" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف المشروع"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                إنشاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث في المشاريع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-semibold text-card-foreground hover:text-primary transition-colors"
                    >
                      {project.name}
                    </Link>
                    <StatusBadge
                      variant={project.status === 'completed' ? 'success' : 'info'}
                      className="mr-2"
                    >
                      {project.status === 'completed' ? 'مكتمل' : 'نشط'}
                    </StatusBadge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                      <span className="sr-only">المزيد من الخيارات</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="gap-2">
                      <Pencil className="w-4 h-4" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">التقدم</span>
                  <span className="font-medium">
                    {project.completedTasks} / {project.tasksCount}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(project.completedTasks / project.tasksCount) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.members} أعضاء</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            لا توجد مشاريع
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'لم يتم العثور على مشاريع تطابق البحث'
              : 'ابدأ بإنشاء مشروعك الأول'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إنشاء مشروع
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
