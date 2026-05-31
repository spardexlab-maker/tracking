import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { AuthNotice, AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { normalizeLocale } from "@/lib/i18n/config";

export default async function SignUpPage({
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
      title={dict.auth.createAccount}
      description={dict.app.tagline}
    >
      <form action={signUpAction} className="grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        {error ? (
          <AuthNotice kind="error">
            {locale === "ar"
              ? "تعذر إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى."
              : "Unable to create the account. Check the details and try again."}
          </AuthNotice>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="fullName">{dict.auth.fullName}</Label>
          <Input id="fullName" name="fullName" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{dict.common.email}</Label>
          <Input id="email" name="email" type="email" required className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{dict.common.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="h-11"
          />
        </div>
        <SubmitButton className="h-11" pendingText={dict.common.signUp}>
          {dict.common.signUp}
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {dict.auth.haveAccount}{" "}
        <Link href={`/${locale}/auth/sign-in`} className="font-medium text-primary hover:underline">
          {dict.common.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}
