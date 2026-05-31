'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  ListTodo,
  MoreVertical,
  Trash2,
  Pencil,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Sample data
const tasks = [
  {
    id: 1,
    title: 'مهمة تجريبية #1',
    project: 'مستشفى كربلاء',
    projectId: 1,
    assignee: 'أحمد محمد',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-05-20',
  },
  {
    id: 2,
    title: 'مهمة تجريبية #2',
    project: 'مستشفى كربلاء',
    projectId: 1,
    assignee: 'سارة علي',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-05-22',
  },
  {
    id: 3,
    title: 'مهمة تجريبية #3',
    project: 'مشروع الصيانة الدورية',
    projectId: 2,
    assignee: 'محمد أحمد',
    status: 'completed',
    priority: 'low',
    dueDate: '2026-05-18',
  },
  {
    id: 4,
    title: 'مهمة تجريبية #4',
    project: 'تطوير البنية التحتية',
    projectId: 3,
    assignee: 'فاطمة حسن',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-05-25',
  },
  {
    id: 5,
    title: 'مراجعة المخططات الهندسية',
    project: 'مستشفى كربلاء',
    projectId: 1,
    assignee: 'علي كريم',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-05-19',
  },
]

const projects = [
  { id: 1, name: 'مستشفى كربلاء' },
  { id: 2, name: 'مشروع الصيانة الدورية' },
  { id: 3, name: 'تطوير البنية التحتية' },
  { id: 4, name: 'تجريبي' },
]

const statusLabels: Record<string, { label: string; variant: 'info' | 'warning' | 'success' }> = {
  'pending': { label: 'قيد الانتظار', variant: 'warning' },
  'in-progress': { label: 'قيد التنفيذ', variant: 'info' },
  'completed': { label: 'مكتمل', variant: 'success' },
}

const priorityLabels: Record<string, { label: string; variant: 'destructive' | 'warning' | 'secondary' }> = {
  'high': { label: 'عالية', variant: 'destructive' },
  'medium': { label: 'متوسطة', variant: 'warning' },
  'low': { label: 'منخفضة', variant: 'secondary' },
}

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.includes(searchQuery) ||
      task.project.includes(searchQuery) ||
      task.assignee.includes(searchQuery)
    const matchesProject =
      selectedProject === 'all' || task.projectId.toString() === selectedProject
    const matchesCompleted = !hideCompleted || task.status !== 'completed'
    return matchesSearch && matchesProject && matchesCompleted
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">كل المهام</h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة جميع المهام في مساحة العمل</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إنشاء مهمة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">عنوان المهمة</Label>
                <Input id="task-title" placeholder="أدخل عنوان المهمة" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-project">المشروع</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">الأولوية</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due">تاريخ التسليم</Label>
                  <Input id="task-due" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">الوصف</Label>
                <Textarea
                  id="task-description"
                  placeholder="أدخل وصف المهمة"
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

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث في المهام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="كل المشاريع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المشاريع</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hide-completed"
              checked={hideCompleted}
              onCheckedChange={(checked) => setHideCompleted(checked as boolean)}
            />
            <Label htmlFor="hide-completed" className="text-sm cursor-pointer">
              إخفاء المكتملة
            </Label>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm w-[300px]">
                  المهمة
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">
                  المشروع
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">
                  الموظف
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">
                  الحالة
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">
                  الأولوية
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">
                  تاريخ التسليم
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm w-[60px]">
                  <span className="sr-only">الإجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-card-foreground hover:text-primary transition-colors"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/projects/${task.projectId}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {task.project}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-muted-foreground">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge variant={statusLabels[task.status].variant}>
                      {statusLabels[task.status].label}
                    </StatusBadge>
                  </td>
                  <td className="p-4">
                    <StatusBadge variant={priorityLabels[task.priority].variant}>
                      {priorityLabels[task.priority].label}
                    </StatusBadge>
                  </td>
                  <td className="p-4 text-muted-foreground tabular-nums">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">المزيد</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.id}`} className="gap-2">
                            <Eye className="w-4 h-4" />
                            عرض التفاصيل
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="w-4 h-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ListTodo className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              لا توجد مهام
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'لم يتم العثور على مهام تطابق البحث'
                : 'ابدأ بإنشاء مهمتك الأولى'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              عرض {filteredTasks.length} من {tasks.length} مهمة
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-w-8">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
