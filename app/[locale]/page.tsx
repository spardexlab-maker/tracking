import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  const featureCards = [
    { label: dict.common.projects, icon: FolderKanban },
    { label: dict.common.tasks, icon: ListTodo },
    { label: dict.common.reports, icon: BarChart3 },
    { label: dict.common.status, icon: CheckCircle2 },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute -top-40 start-[-10rem] size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] end-[-6rem] size-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
              م
            </span>
            <span>
              <span className="block text-lg font-bold">{dict.app.name}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {dict.app.tagline}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale === "ar" ? "en" : "ar"}`}
              className={cn(buttonVariants({ variant: "outline" }), "bg-card shadow-sm")}
            >
              {locale === "ar" ? "English" : "العربية"}
            </Link>
            <Link href={`/${locale}/auth/sign-in`} className={cn(buttonVariants())}>
              {dict.common.signIn}
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
              <ShieldCheck className="size-4 text-primary" />
              {locale === "ar"
                ? "منصة عربية لإدارة العمل التشغيلي"
                : "Arabic-first operations workspace"}
            </p>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                {dict.app.tagline}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {locale === "ar"
                  ? "مساحة واحدة للمشاريع والمهام والتعليقات والمرفقات والتقارير، مصممة للعربية أولًا وتبقى أنيقة على الهاتف وسطح المكتب."
                  : "One calm workspace for projects, tasks, comments, attachments, and reports—Arabic-first, mobile-ready, and built for teams."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/auth/sign-up`}
                className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
              >
                {dict.common.signUp}
              </Link>
              <Link
                href={`/${locale}/auth/sign-in`}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 bg-card px-5",
                )}
              >
                {dict.common.signIn}
              </Link>
            </div>
          </div>

          <div className="enterprise-panel p-4 sm:p-5">
            <div className="rounded-3xl bg-sidebar p-4 text-sidebar-foreground sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{dict.common.dashboard}</p>
                  <p className="text-sm text-sidebar-foreground/60">{dict.common.workspace}</p>
                </div>
                <span className="rounded-full bg-sidebar-primary px-3 py-1 text-xs text-sidebar-primary-foreground">
                  Live
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {featureCards.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4"
                  >
                    <Icon className="mb-5 size-5 text-sidebar-primary" />
                    <p className="font-medium">{label}</p>
                    <div className="mt-3 h-2 rounded-full bg-sidebar-border">
                      <div className="h-2 w-2/3 rounded-full bg-sidebar-primary" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
                <p className="text-sm text-sidebar-foreground/70">{dict.common.activity}</p>
                <p className="mt-1 font-medium">
                  {locale === "ar"
                    ? "كل تحديث موثق في سجل واضح."
                    : "Every update is captured in a clear timeline."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

