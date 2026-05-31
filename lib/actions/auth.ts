"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

export async function signInAction(formData: FormData) {
  const locale = getLocale(formData);
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/auth/sign-in?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/${locale}/auth/sign-in?error=credentials`);
  }

  redirect(`/${locale}/dashboard`);
}

export async function signUpAction(formData: FormData) {
  const locale = getLocale(formData);
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/auth/sign-up?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/${locale}/auth/sign-up?error=signup`);
  }

  redirect(`/${locale}/auth/sign-in?created=1`);
}

export async function forgotPasswordAction(formData: FormData) {
  const locale = getLocale(formData);
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/auth/forgot-password?error=invalid`);
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/reset-password`,
  });

  redirect(`/${locale}/auth/forgot-password?sent=1`);
}

export async function resetPasswordAction(formData: FormData) {
  const locale = getLocale(formData);
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/auth/reset-password?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirect(`/${locale}/auth/reset-password?error=update`);
  }

  redirect(`/${locale}/auth/sign-in?reset=1`);
}

export async function signOutAction(formData: FormData) {
  const locale = getLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
