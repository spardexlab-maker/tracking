import { redirect } from "next/navigation";
import { createWorkspaceAction } from "@/lib/actions/workspace";
import { requireUser } from "@/lib/auth/session";
import { getActiveWorkspaceContext } from "@/lib/db/workspace";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);
  const existing = await getActiveWorkspaceContext(user.id);
  const dict = getDictionary(locale);

  if (existing) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.onboarding.title}
      description={dict.onboarding.description}
      wide
    >
      <form action={createWorkspaceAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        {error ? (
          <AuthNotice kind="error">
            {locale === "ar"
              ? "تعذر إنشاء مساحة العمل. تأكد من الاسم وحاول مرة أخرى."
              : "Unable to create the workspace. Check the name and try again."}
          </AuthNotice>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="name">{dict.onboarding.workspaceName}</Label>
          <Input id="name" name="name" required className="h-11" />
        </div>
        <SubmitButton className="h-11" pendingText={dict.onboarding.createWorkspace}>
          {dict.onboarding.createWorkspace}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
