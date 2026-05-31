import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bolt,
  Building2,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  Filter,
  Gauge,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Tone = "urgent" | "working" | "done" | "review";

type ReportRow = {
  id: string;
  area: string;
  team: string;
  status: string;
  tone: Tone;
  due: string;
};

type Metric = {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
};

const reports: ReportRow[] = [
  {
    id: "FR-204",
    area: "محطة حي الجامعة",
    team: "فريق الصيانة 3",
    status: "قيد المعالجة",
    tone: "working",
    due: "اليوم 14:30",
  },
  {
    id: "FR-198",
    area: "خط النصر",
    team: "فريق الطوارئ",
    status: "عاجلة",
    tone: "urgent",
    due: "اليوم 11:00",
  },
  {
    id: "FR-185",
    area: "مغذي الكرامة",
    team: "فريق الفحص",
    status: "بانتظار الاعتماد",
    tone: "review",
    due: "غدًا 09:00",
  },
  {
    id: "FR-172",
    area: "محطة اليرموك",
    team: "فريق الشبكات",
    status: "مكتملة",
    tone: "done",
    due: "أمس 16:10",
  },
];

const metrics: Metric[] = [
  {
    label: "الأعطال المفتوحة",
    value: "128",
    note: "+12 منذ الصباح",
    icon: AlertTriangle,
  },
  {
    label: "المهام المكتملة",
    value: "347",
    note: "91% ضمن الوقت",
    icon: CheckCircle2,
  },
  {
    label: "الفرق الميدانية",
    value: "24",
    note: "18 تعمل الآن",
    icon: Users,
  },
  {
    label: "متوسط الاستجابة",
    value: "18 د",
    note: "-4 دقائق هذا الأسبوع",
    icon: Clock3,
  },
];

const recentActivity = [
  "تم تصعيد عطل في محطة حي الجامعة إلى فريق الطوارئ",
  "أرسل فريق الصيانة صورة إثبات بعد الإصلاح",
  "اعتمد المدير إغلاق البلاغ FR-172",
];

const concepts = [
  {
    id: "government",
    title: "1. لوحة حكومية مؤسسية",
    subtitle: "رصينة، عالية الثقة، مناسبة للجهات الرسمية والتقارير التنفيذية.",
    shell: "bg-[#f7f4ef]",
    panel: "border-[#d7d1c3] bg-white",
    accent: "bg-[#164e63] text-white",
    sidebar: "bg-[#123542] text-slate-100",
    chip: "bg-[#e8efe8] text-[#214f39]",
  },
  {
    id: "saas",
    title: "2. لوحة SaaS حديثة",
    subtitle: "نظيفة، مشرقة، ومسحوبة نحو التحليلات والسرعة.",
    shell: "bg-slate-50",
    panel: "border-slate-200 bg-white",
    accent: "bg-slate-950 text-white",
    sidebar: "bg-white text-slate-900",
    chip: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "command",
    title: "3. مركز قيادة العمليات",
    subtitle: "داكن، عالي التباين، مناسب لغرفة مراقبة الأعطال.",
    shell: "bg-slate-950 text-slate-100",
    panel: "border-slate-800 bg-slate-900",
    accent: "bg-cyan-400 text-slate-950",
    sidebar: "bg-slate-900 text-slate-100",
    chip: "bg-cyan-400/15 text-cyan-200",
  },
  {
    id: "minimal",
    title: "4. لوحة إدارية نظيفة",
    subtitle: "أقل زخرفة، أكثر هدوءًا، مناسبة للعمل اليومي الطويل.",
    shell: "bg-white",
    panel: "border-slate-200 bg-white",
    accent: "bg-slate-900 text-white",
    sidebar: "bg-slate-50 text-slate-900",
    chip: "bg-slate-100 text-slate-700",
  },
  {
    id: "mobile",
    title: "5. واجهة ميدانية أولًا للجوال",
    subtitle: "بطاقات كبيرة، إجراءات سريعة، ومناسبة للفنيين في الحركة.",
    shell: "bg-[#eef7f4]",
    panel: "border-emerald-100 bg-white",
    accent: "bg-emerald-600 text-white",
    sidebar: "bg-emerald-950 text-emerald-50",
    chip: "bg-emerald-50 text-emerald-700",
  },
] as const;

function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  const className =
    tone === "urgent"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "working"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : tone === "done"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed p-4 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100">
        <ClipboardPlus className="size-5" />
      </div>
      <p className="mt-3 font-medium">لا توجد بلاغات مطابقة</p>
      <p className="mt-1 text-sm opacity-70">ابدأ بإنشاء بلاغ جديد أو غيّر عوامل التصفية.</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3" aria-label="مثال تحميل">
      <div className="h-4 w-36 animate-pulse rounded-full bg-current/10" />
      <div className="grid gap-2">
        <div className="h-12 animate-pulse rounded-2xl bg-current/10" />
        <div className="h-12 animate-pulse rounded-2xl bg-current/10" />
      </div>
    </div>
  );
}

function ConceptShell({
  concept,
}: {
  concept: (typeof concepts)[number];
}) {
  const mobileFirst = concept.id === "mobile";

  return (
    <section id={concept.id} className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{concept.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{concept.subtitle}</p>
      </div>

      <div
        className={`overflow-hidden rounded-[2rem] border shadow-sm ${concept.shell}`}
        dir="rtl"
      >
        <div
          className={`grid min-h-[760px] ${
            mobileFirst ? "lg:grid-cols-1" : "lg:grid-cols-[250px_1fr]"
          }`}
        >
          {!mobileFirst && (
            <aside className={`hidden p-5 lg:block ${concept.sidebar}`}>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                  <Bolt className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">منصة التشغيل</p>
                  <p className="text-xs opacity-70">قطاع الكهرباء</p>
                </div>
              </div>
              <nav className="mt-8 grid gap-2 text-sm">
                {[
                  ["لوحة التحكم", LayoutDashboard],
                  ["البلاغات", Wrench],
                  ["التقارير", BarChart3],
                  ["الفرق", Users],
                ].map(([label, Icon]) => {
                  const LucideIcon = Icon as React.ComponentType<{ className?: string }>;
                  return (
                    <div
                      key={String(label)}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3"
                    >
                      <LucideIcon className="size-4" />
                      <span>{String(label)}</span>
                    </div>
                  );
                })}
              </nav>
            </aside>
          )}

          <div className="min-w-0">
            <header className={`border-b p-4 sm:p-6 ${concept.panel}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="size-4" />
                  </Button>
                  <div>
                    <p className="text-sm opacity-70">مركز متابعة الأعطال</p>
                    <h3 className="text-xl font-semibold">نظرة اليوم التشغيلية</h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Bell className="size-4" />
                  </Button>
                  <Button className={concept.accent}>
                    <ClipboardPlus className="size-4" />
                    إنشاء بلاغ
                  </Button>
                </div>
              </div>
            </header>

            <main className="space-y-4 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <Card key={metric.label} className={concept.panel}>
                      <CardContent className="flex items-start justify-between p-4">
                        <div>
                          <p className="text-sm opacity-70">{metric.label}</p>
                          <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                          <p className="mt-1 text-xs opacity-70">{metric.note}</p>
                        </div>
                        <div className={`rounded-2xl p-2 ${concept.chip}`}>
                          <Icon className="size-5" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className={concept.panel}>
                <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto_auto]">
                  <label className="flex items-center gap-2 rounded-2xl border px-3">
                    <Search className="size-4 opacity-60" />
                    <input
                      aria-label="بحث"
                      placeholder="بحث بالمنطقة أو رقم البلاغ"
                      className="h-11 w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                  <Button variant="outline">
                    <Filter className="size-4" />
                    الحالة
                  </Button>
                  <Button variant="outline">آخر 7 أيام</Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_360px]">
                <Card className={concept.panel}>
                  <CardHeader>
                    <CardTitle>إدارة البلاغات</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>البلاغ</TableHead>
                          <TableHead>الموقع</TableHead>
                          <TableHead>الفريق</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الموعد</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>{report.area}</TableCell>
                            <TableCell>{report.team}</TableCell>
                            <TableCell>
                              <StatusBadge tone={report.tone} label={report.status} />
                            </TableCell>
                            <TableCell>{report.due}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  <Card className={concept.panel}>
                    <CardHeader>
                      <CardTitle>النشاط الأخير</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {recentActivity.map((item) => (
                        <div key={item} className="flex gap-3 text-sm">
                          <Activity className="mt-0.5 size-4 shrink-0 opacity-60" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className={concept.panel}>
                    <CardHeader>
                      <CardTitle>حالة فارغة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmptyState />
                    </CardContent>
                  </Card>

                  <Card className={concept.panel}>
                    <CardHeader>
                      <CardTitle>حالة التحميل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LoadingSkeleton />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {mobileFirst && (
                <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
                  {reports.map((report) => (
                    <Card key={`mobile-${report.id}`} className={concept.panel}>
                      <CardContent className="grid gap-3 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{report.id}</span>
                          <StatusBadge tone={report.tone} label={report.status} />
                        </div>
                        <p className="text-sm">{report.area}</p>
                        <div className="flex items-center justify-between text-sm opacity-70">
                          <span>{report.team}</span>
                          <span>{report.due}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UiLabShowcase() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs text-white">
                <Sparkles className="size-3.5" />
                مختبر واجهات معزول
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                خمسة اتجاهات تصميمية لواجهة عربية RTL
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                كل نموذج أدناه يستخدم المحتوى نفسه حتى يكون الفرق في الشخصية البصرية،
                وليس في البيانات.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                [ShieldCheck, "RTL"],
                [Building2, "إداري"],
                [Gauge, "تشغيلي"],
                [Smartphone, "متجاوب"],
              ].map(([Icon, label]) => {
                const LucideIcon = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2 rounded-2xl border bg-slate-50 px-3 py-2"
                  >
                    <LucideIcon className="size-4" />
                    <span>{String(label)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {concepts.map((concept) => (
              <a
                key={concept.id}
                href={`#${concept.id}`}
                className="rounded-full border bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                {concept.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </nav>
        </section>

        <div className="space-y-10">
          {concepts.map((concept) => (
            <ConceptShell key={concept.id} concept={concept} />
          ))}
        </div>
      </div>
    </main>
  );
}
