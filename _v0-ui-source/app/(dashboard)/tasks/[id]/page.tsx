'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  Paperclip,
  MessageSquare,
  Send,
  Download,
  FileText,
  Image,
  MoreVertical,
  Trash2,
  Pencil,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Sample task data
const task = {
  id: 1,
  title: 'مهمة تجريبية #1',
  description:
    'هذه مهمة تجريبية لاختبار النظام. يجب مراجعة جميع المخططات الهندسية والتأكد من مطابقتها للمواصفات المطلوبة قبل البدء في التنفيذ.',
  project: { id: 1, name: 'مستشفى كربلاء' },
  assignee: { name: 'أحمد محمد', avatar: 'أ' },
  status: 'in-progress',
  priority: 'high',
  progress: 60,
  dueDate: '2026-05-20',
  createdAt: '2026-05-10',
  updatedAt: '2026-05-15',
}

const attachments = [
  { id: 1, name: 'المخطط_الهندسي.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2026-05-12' },
  { id: 2, name: 'صورة_الموقع.jpg', type: 'image', size: '1.2 MB', uploadedAt: '2026-05-14' },
  { id: 3, name: 'تقرير_التقدم.docx', type: 'doc', size: '856 KB', uploadedAt: '2026-05-15' },
]

const comments = [
  {
    id: 1,
    author: { name: 'سارة علي', avatar: 'س' },
    content: 'تم مراجعة المخططات وهناك بعض الملاحظات التي يجب مناقشتها.',
    createdAt: '2026-05-14T10:30:00',
  },
  {
    id: 2,
    author: { name: 'أحمد محمد', avatar: 'أ' },
    content: 'تم تعديل المخططات بناءً على الملاحظات. الرجاء المراجعة مرة أخرى.',
    createdAt: '2026-05-15T14:45:00',
  },
]

const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'in-progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
]

export default function TaskDetailPage() {
  const [newComment, setNewComment] = useState('')
  const [currentStatus, setCurrentStatus] = useState(task.status)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image
      default:
        return FileText
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
          كل المهام
        </Link>
        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
        <span className="text-foreground font-medium">{task.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-card-foreground">{task.title}</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
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

            <p className="text-muted-foreground leading-relaxed mb-6">
              {task.description}
            </p>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">تقدم المهمة</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">المشروع</p>
                <Link
                  href={`/projects/${task.project.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {task.project.name}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">المسؤول</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {task.assignee.avatar}
                  </div>
                  <span className="text-sm font-medium">{task.assignee.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">تاريخ التسليم</p>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">آخر تحديث</p>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {new Date(task.updatedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          </div>

          {/* Update Progress Section */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              تحديث تقدم المهمة
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  تحديث الحالة
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-card-foreground">
                  التعليقات ({comments.length})
                </h2>
              </div>
            </div>

            {/* Comments List */}
            <div className="divide-y divide-border">
              {comments.map((comment) => (
                <div key={comment.id} className="p-5">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                      {comment.author.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-card-foreground">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="p-5 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                  م
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="أضف تعليقاً..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="mb-3"
                  />
                  <Button className="gap-2" disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">الحالة</p>
              <StatusBadge
                variant={
                  currentStatus === 'completed'
                    ? 'success'
                    : currentStatus === 'in-progress'
                    ? 'info'
                    : 'warning'
                }
              >
                {statusOptions.find((s) => s.value === currentStatus)?.label}
              </StatusBadge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">الأولوية</p>
              <StatusBadge
                variant={
                  task.priority === 'high'
                    ? 'destructive'
                    : task.priority === 'medium'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {task.priority === 'high'
                  ? 'عالية'
                  : task.priority === 'medium'
                  ? 'متوسطة'
                  : 'منخفضة'}
              </StatusBadge>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold text-card-foreground">
                    المرفقات ({attachments.length})
                  </h2>
                </div>
                <Button variant="outline" size="sm">
                  رفع ملف
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.type)
                return (
                  <div
                    key={attachment.id}
                    className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.size}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Download className="w-4 h-4" />
                      <span className="sr-only">تحميل</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
