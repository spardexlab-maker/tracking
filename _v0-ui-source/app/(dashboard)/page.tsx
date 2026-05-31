import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare,
  Upload,
  Activity,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusBadge } from '@/components/dashboard/status-badge'
import Link from 'next/link'

// Sample data - in production, this would come from an API
const stats = [
  { title: 'إجمالي المشاريع', value: 5, icon: FolderKanban, variant: 'primary' as const },
  { title: 'إجمالي المهام', value: 24, icon: ListTodo, variant: 'default' as const },
  { title: 'المهام المكتملة', value: 18, icon: CheckCircle2, variant: 'success' as const },
  { title: 'المهام المتأخرة', value: 3, icon: AlertTriangle, variant: 'destructive' as const },
]

const recentProjects = [
  { id: 1, name: 'مستشفى كربلاء', tasksCount: 8, completedTasks: 5, status: 'active' },
  { id: 2, name: 'مشروع الصيانة الدورية', tasksCount: 12, completedTasks: 10, status: 'active' },
  { id: 3, name: 'تطوير البنية التحتية', tasksCount: 4, completedTasks: 4, status: 'completed' },
]

const recentActivities = [
  { id: 1, type: 'status', message: 'تم تغيير الحالة', task: 'مهمة تجريبية #1', time: 'منذ 5 دقائق', icon: Activity },
  { id: 2, type: 'attachment', message: 'تم رفع مرفق', task: 'مهمة تجريبية #2', time: 'منذ 15 دقيقة', icon: Upload },
  { id: 3, type: 'comment', message: 'تمت إضافة تعليق', task: 'مهمة تجريبية #3', time: 'منذ ساعة', icon: MessageSquare },
  { id: 4, type: 'create', message: 'تم إنشاء المهمة', task: 'مهمة تجريبية #4', time: 'منذ ساعتين', icon: FileText },
]

const pendingTasks = [
  { id: 1, title: 'مراجعة المخططات الهندسية', project: 'مستشفى كربلاء', dueDate: '2026-05-20', priority: 'high' },
  { id: 2, title: 'تحديث تقرير التقدم الشهري', project: 'مشروع الصيانة الدورية', dueDate: '2026-05-18', priority: 'medium' },
  { id: 3, title: 'اجتماع مع المقاولين', project: 'تطوير البنية التحتية', dueDate: '2026-05-22', priority: 'low' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً، مدير التجربة</h1>
          <p className="text-muted-foreground mt-1">إليك نظرة عامة على نشاط مساحة العمل</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>آخر تحديث: منذ دقيقتين</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground">أحدث المشاريع</h2>
            <Link
              href="/projects"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.completedTasks} من {project.tasksCount} مهام مكتملة
                    </p>
                  </div>
                </div>
                <StatusBadge variant={project.status === 'completed' ? 'success' : 'info'}>
                  {project.status === 'completed' ? 'مكتمل' : 'نشط'}
                </StatusBadge>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground">أحدث النشاطات</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <activity.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {activity.task}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">المهام المطلوب إنجازها</h2>
          <Link
            href="/tasks"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            عرض كل المهام
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">المهمة</th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">المشروع</th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">تاريخ التسليم</th>
                <th className="text-right p-4 font-semibold text-muted-foreground text-sm">الأولوية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingTasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-card-foreground hover:text-primary"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{task.project}</td>
                  <td className="p-4 text-muted-foreground tabular-nums">
                    {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
