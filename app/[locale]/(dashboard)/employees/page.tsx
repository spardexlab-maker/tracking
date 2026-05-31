import { redirect } from "next/navigation";
import {
  createManagedUserAction,
  updateManagedUserProfileAction,
  updateMemberRoleAction,
} from "@/lib/actions/workspace";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveWorkspaceContext,
  getWorkspaceMembers,
} from "@/lib/db/workspace";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";

const leaders = new Set(["owner", "admin", "manager"]);

export default async function EmployeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, saved, created } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);

  if (!context || !leaders.has(context.role)) {
    redirect(`/${locale}/dashboard`);
  }

  const members = await getWorkspaceMembers(context.workspace.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.navigation.employees}
        description={locale === "ar" ? "إدارة وتعديل حسابات الموظفين وكلمات المرور" : "Manage employee profiles and passwords"}
      />

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {locale === "ar" ? "تعذر تحديث الحساب. يرجى التأكد من البيانات والمحاولة مجدداً." : "Unable to process the request. Check inputs and try again."}
        </div>
      )}

      {saved && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600">
          {dict.feedback.saved}
        </div>
      )}

      {created && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600">
          {locale === "ar" ? "تم إنشاء حساب الموظف بنجاح." : "Employee account created successfully."}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Employees List */}
        <Card className="py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>{dict.settings.memberManagement}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            {members.map((member) => {
              const profile = Array.isArray(member.user) ? member.user[0] : member.user;
              const isSelf = profile.id === user.id;

              return (
                <div
                  key={member.id}
                  className="rounded-2xl border bg-background p-4 space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-base">{profile.full_name ?? profile.email}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                    
                    {!isSelf && (
                      <form action={updateMemberRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <Select name="role" defaultValue={member.role}>
                          <SelectTrigger className="w-32 h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">{dict.common.owner}</SelectItem>
                            <SelectItem value="admin">{dict.common.admin}</SelectItem>
                            <SelectItem value="manager">{dict.common.manager}</SelectItem>
                            <SelectItem value="member">{dict.common.member}</SelectItem>
                            <SelectItem value="viewer">{dict.common.viewer}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" className="h-9 px-3">
                          {dict.common.save}
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Profile & Password Edit Form */}
                  <form action={updateManagedUserProfileAction} className="grid gap-3 border-t pt-4">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="workspaceId" value={context.workspace.id} />
                    <input type="hidden" name="memberId" value={profile.id} />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`name-${profile.id}`} className="text-xs text-muted-foreground">
                          {dict.auth.fullName}
                        </Label>
                        <Input
                          id={`name-${profile.id}`}
                          name="fullName"
                          defaultValue={profile.full_name ?? ""}
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`pass-${profile.id}`} className="text-xs text-muted-foreground">
                          {dict.settings.changePassword}
                        </Label>
                        <Input
                          id={`pass-${profile.id}`}
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          minLength={8}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="w-fit h-9 px-4">
                      {locale === "ar" ? "تحديث الملف وكلمة المرور" : "Update Profile & Password"}
                    </Button>
                  </form>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Create Employee Account Card */}
        <Card className="py-0 h-fit">
          <CardHeader className="border-b py-4">
            <CardTitle>{dict.settings.createUser}</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <form action={createManagedUserAction} className="grid gap-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="workspaceId" value={context.workspace.id} />
              
              <div className="grid gap-2">
                <Label htmlFor="managedFullName">{dict.auth.fullName}</Label>
                <Input id="managedFullName" name="fullName" required className="h-11" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="managedEmail">{dict.common.email}</Label>
                <Input id="managedEmail" name="email" type="email" required className="h-11" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="managedPassword">{dict.common.password}</Label>
                <Input
                  id="managedPassword"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>{dict.common.role}</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{dict.common.admin}</SelectItem>
                    <SelectItem value="manager">{dict.common.manager}</SelectItem>
                    <SelectItem value="member">{dict.common.member}</SelectItem>
                    <SelectItem value="viewer">{dict.common.viewer}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full h-11">{dict.common.create}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
