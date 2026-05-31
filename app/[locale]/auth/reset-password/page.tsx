import { resetPasswordAction } from "@/lib/actions/auth";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const dict = getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.resetPassword}
      description={locale === "ar" ? "اختر كلمة مرور قوية لحسابك." : "Choose a strong new password."}
    >
      <form action={resetPasswordAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        {error ? (
          <AuthNotice kind="error">{dict.feedback.passwordsMismatch}</AuthNotice>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="password">{dict.auth.newPassword}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">{dict.auth.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
            className="h-11"
          />
        </div>
        <SubmitButton className="h-11" pendingText={dict.common.update}>
          {dict.common.update}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
