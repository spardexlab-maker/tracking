import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, sent } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const dict = getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.forgotPassword}
      description={dict.auth.resetInstructions}
    >
      <form action={forgotPasswordAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        {sent ? (
          <AuthNotice kind="success">
            {locale === "ar"
              ? "إذا كان البريد مسجلًا، سيصلك رابط الاستعادة خلال لحظات."
              : "If the email exists, a reset link will arrive shortly."}
          </AuthNotice>
        ) : null}
        {error ? (
          <AuthNotice kind="error">{dict.feedback.invalidEmail}</AuthNotice>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="email">{dict.common.email}</Label>
          <Input id="email" name="email" type="email" required className="h-11" />
        </div>
        <SubmitButton className="h-11" pendingText={dict.auth.sendResetLink}>
          {dict.auth.sendResetLink}
        </SubmitButton>
      </form>
      <Link
        href={`/${locale}/auth/sign-in`}
        className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
      >
        {dict.common.back}
      </Link>
    </AuthShell>
  );
}
