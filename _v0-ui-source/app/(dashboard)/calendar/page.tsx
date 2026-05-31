import { Calendar as CalendarIcon, Clock } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">التقويم</h1>
        <p className="text-muted-foreground mt-1">عرض المهام والأحداث في شكل تقويم</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CalendarIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            قريباً
          </h2>
          <p className="text-muted-foreground max-w-md">
            نعمل على تطوير عرض التقويم التفاعلي لتتمكن من رؤية جميع مهامك ومواعيدك بشكل مرئي.
          </p>
          <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>متوقع الإطلاق: قريباً</span>
          </div>
        </div>
      </div>
    </div>
  )
}
