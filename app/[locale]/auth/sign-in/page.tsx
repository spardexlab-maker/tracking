import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; created?: string; reset?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error, created, reset } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const dict = getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      dict={dict}
      title={dict.auth.welcomeBack}
      description={dict.app.tagline}
    >
      <form action={signInAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />

        {created ? (
          <AuthNotice kind="success">
            {locale === "ar"
              ? "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن."
              : "Account created. You can sign in now."}
          </AuthNotice>
        ) : null}
        {reset ? (
          <AuthNotice kind="success">{dict.auth.passwordUpdated}</AuthNotice>
        ) : null}
        {error ? (
          <AuthNotice kind="error">
            {locale === "ar"
              ? "تعذر تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور."
              : "Unable to sign in. Check your email and password."}
          </AuthNotice>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="email">{dict.common.email}</Label>
          <Input id="email" name="email" type="email" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password">{dict.common.password}</Label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm text-primary hover:underline"
            >
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <Input id="password" name="password" type="password" required className="h-11" />
        </div>
        <SubmitButton className="h-11" pendingText={dict.common.signIn}>
          {dict.common.signIn}
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {dict.auth.noAccount}{" "}
        <Link href={`/${locale}/auth/sign-up`} className="font-medium text-primary hover:underline">
          {dict.common.signUp}
        </Link>
      </p>
    </AuthShell>
  );
}
