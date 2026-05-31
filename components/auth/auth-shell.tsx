import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AuthShell({
  locale,
  dict,
  title,
  description,
  children,
  wide = false,
}: {
  locale: Locale;
  dict: Dictionary;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const alternateLocale = locale === "ar" ? "en" : "ar";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-y-0 end-0 hidden w-[42%] bg-sidebar lg:block" />
      <div className="absolute -top-40 start-[-10rem] size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] end-1/4 size-80 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1fr_0.85fr]">
        <section className="flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
                م
              </span>
              <span>
                <span className="block text-lg font-bold">{dict.app.name}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {dict.app.tagline}
                </span>
              </span>
            </Link>

            <Link
              href={`/${alternateLocale}`}
              className={cn(buttonVariants({ variant: "outline" }), "bg-card shadow-sm")}
            >
              {locale === "ar" ? "English" : "العربية"}
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className={cn("w-full", wide ? "max-w-xl" : "max-w-md")}>
              <div className="mb-6">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {locale === "ar" ? "منصة آمنة لإدارة فرق العمل" : "Secure team operations"}
                </p>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description ? (
                  <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
                ) : null}
              </div>

              <div className="enterprise-panel p-5 sm:p-6">{children}</div>
            </div>
          </div>
        </section>

        <aside className="hidden min-h-screen bg-sidebar px-8 py-8 text-sidebar-foreground lg:flex lg:flex-col">
          <div className="ms-auto flex size-14 items-center justify-center rounded-3xl bg-sidebar-primary text-2xl font-bold text-sidebar-primary-foreground">
            م
          </div>

          <div className="mt-auto space-y-8">
            <div>
              <p className="text-sm text-sidebar-foreground/60">
                {locale === "ar" ? "نظام تشغيلي متكامل" : "Integrated operating system"}
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight">
                {locale === "ar"
                  ? "إدارة مشاريع ومهام ومرفقات فريقك من مساحة واحدة واضحة."
                  : "Manage projects, tasks, files, and team progress in one focused workspace."}
              </h2>
            </div>

            <div className="grid gap-3">
              {[
                dict.common.projects,
                dict.common.tasks,
                dict.common.attachments,
                dict.common.reports,
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4"
                >
                  <span>{item}</span>
                  <CheckCircle2 className="size-5 text-sidebar-primary" />
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/${locale}`}
            className="mt-8 inline-flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <ArrowLeft className="size-4" />
            {dict.common.back}
          </Link>
        </aside>
      </div>
    </main>
  );
}

export function AuthNotice({
  kind = "info",
  children,
}: {
  kind?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  const className =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : kind === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-blue-200 bg-blue-50 text-blue-800";

  return <p className={cn("rounded-2xl border px-3 py-2 text-sm", className)}>{children}</p>;
}

