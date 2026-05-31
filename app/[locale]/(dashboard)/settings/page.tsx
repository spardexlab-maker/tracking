import {
  inviteMemberAction,
  createManagedUserAction,
  updateMemberRoleAction,
  updateWorkspaceAction,
} from "@/lib/actions/workspace";
import { updateProfileAction } from "@/lib/actions/settings";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveWorkspaceContext,
  getPendingInvitations,
  getWorkspaceMembers,
} from "@/lib/db/workspace";
import { getProfileSettings } from "@/lib/db/profile";
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
import { UploadWorkspaceLogoForm } from "@/components/workspace/upload-workspace-logo-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const context = await getActiveWorkspaceContext(user.id);
  const [members, invitations, profileData] = await Promise.all([
    getWorkspaceMembers(context!.workspace.id),
    getPendingInvitations(context!.workspace.id),
    getProfileSettings(user.id),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <PageHeader title={dict.common.settings} description={context!.workspace.name} />

      <div className="grid gap-6 xl:grid-cols-2">
      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.workspaceSettings}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <UploadWorkspaceLogoForm
            locale={locale}
            workspaceId={context!.workspace.id}
            labelName={locale === "ar" ? "شعار البرنامج" : "Program Logo"}
            buttonText={locale === "ar" ? "تغيير الشعار" : "Change Logo"}
            errorText={locale === "ar" ? "تعذر رفع الشعار. حاول مرة أخرى." : "Unable to upload logo."}
            successText={locale === "ar" ? "تم تحديث شعار البرنامج بنجاح." : "Program logo updated successfully."}
          />
          <div className="border-t my-1" />
          <form action={updateWorkspaceAction} className="grid gap-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="workspaceId" value={context!.workspace.id} />
            <div className="grid gap-2">
              <Label htmlFor="workspaceName">{dict.common.name}</Label>
              <Input
                key={context!.workspace.name}
                id="workspaceName"
                name="name"
                defaultValue={context!.workspace.name}
                className="h-11"
              />
            </div>
            <Button variant="outline">{dict.common.update}</Button>
          </form>
          <p className="text-sm">
            <span className="text-muted-foreground">{dict.common.role}: </span>
            {dict.common[context!.role]}
          </p>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.createUser}</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <form action={createManagedUserAction} className="grid gap-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="workspaceId" value={context!.workspace.id} />
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
            <Button>{dict.common.create}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.profileSettings}</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <form action={updateProfileAction} className="grid gap-4">
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-2">
              <Label htmlFor="fullName">{dict.auth.fullName}</Label>
              <Input
                key={profileData.profile?.full_name ?? ""}
                id="fullName"
                name="fullName"
                defaultValue={profileData.profile?.full_name ?? ""}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label>{dict.common.language}</Label>
              <Select
                name="nextLocale"
                defaultValue={profileData.settings?.locale ?? locale}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{dict.common.theme}</Label>
              <Select
                name="theme"
                defaultValue={profileData.settings?.theme ?? "system"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>{dict.common.save}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.inviteMember}</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <form action={inviteMemberAction} className="grid gap-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="workspaceId" value={context!.workspace.id} />
            <div className="grid gap-2">
              <Label htmlFor="email">{dict.common.email}</Label>
              <Input id="email" name="email" type="email" required className="h-11" />
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
            <Button>{dict.settings.inviteMember}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="py-0 xl:col-span-2">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.memberManagement}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 py-4">
          {members.map((member) => {
            const profile = Array.isArray(member.user) ? member.user[0] : member.user;
            return (
              <div
                key={member.id}
                className="flex flex-col gap-2 rounded-2xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{profile.full_name ?? profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <form action={updateMemberRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="memberId" value={member.id} />
                  <Select name="role" defaultValue={member.role}>
                    <SelectTrigger className="w-36">
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
                  <Button size="sm" variant="outline">
                    {dict.common.save}
                  </Button>
                </form>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="py-0 xl:col-span-2">
        <CardHeader className="border-b py-4">
          <CardTitle>{dict.settings.pendingInvitations}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 py-4">
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-2 rounded-2xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {dict.common[invitation.role as keyof typeof dict.common]}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(invitation.expires_at).toLocaleDateString(locale)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
