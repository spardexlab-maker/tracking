import { acceptWorkspaceInvitationAction } from "@/lib/actions/workspace";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function AcceptInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { token, error } = await searchParams;
  const dict = getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.invite.title}
      description={dict.invite.description}
      wide
    >
      <form action={acceptWorkspaceInvitationAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="token" value={token ?? ""} />
        {error ? (
          <AuthNotice kind="error">
            {locale === "ar"
              ? "رابط الدعوة غير صالح أو انتهت صلاحيته."
              : "The invitation link is invalid or expired."}
          </AuthNotice>
        ) : null}
        {!token ? (
          <AuthNotice kind="error">
            {locale === "ar"
              ? "لا يوجد رمز دعوة في الرابط."
              : "No invitation token was found in the link."}
          </AuthNotice>
        ) : null}
        <SubmitButton disabled={!token} className="h-11" pendingText={dict.invite.accept}>
          {dict.invite.accept}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
