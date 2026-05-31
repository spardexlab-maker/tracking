import Link from "next/link";
import { FolderKanban, Search } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getProjects } from "@/lib/db/projects";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { ProjectForm } from "@/components/projects/project-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const projectManagers = new Set(["owner", "admin", "manager"]);

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { q } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);
  const canManageProjects = projectManagers.has(context!.role);
  const projects = (await getProjects(context!.workspace.id)).filter((project) =>
    q ? project.name.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.common.projects}
        description={dict.projects.projectDashboard}
        action={
          canManageProjects ? (
            <Sheet>
              <SheetTrigger render={<Button />}>{dict.projects.createProject}</SheetTrigger>
              <SheetContent
                side={locale === "ar" ? "left" : "right"}
                className="w-full overflow-y-auto sm:max-w-md"
              >
                <SheetHeader className="text-start">
                  <SheetTitle>{dict.projects.createProject}</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-4">
                  <ProjectForm
                    locale={locale}
                    dict={dict}
                    workspaceId={context!.workspace.id}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : undefined
        }
      />

      <form className="enterprise-panel flex flex-col gap-3 p-4 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder={dict.common.search}
            className="h-11 w-full rounded-xl border bg-background px-4 pe-10 text-sm"
          />
        </label>
        <Button className="h-11 px-5">{dict.common.search}</Button>
      </form>

      {projects.length === 0 ? (
        <div className="enterprise-panel flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FolderKanban className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">{dict.projects.emptyState}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/${locale}/projects/${project.id}`}
              className="enterprise-panel group p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FolderKanban className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold group-hover:text-primary">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dict.common.project}
                    </p>
                  </div>
                </div>
                {project.archived_at ? (
                  <StatusBadge variant="secondary">{dict.projects.archived}</StatusBadge>
                ) : (
                  <StatusBadge variant="info">{dict.projects.active}</StatusBadge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
