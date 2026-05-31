import type { Metadata } from "next";
import { Suspense } from "react";
import { Cairo, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { UrlFeedbackToast } from "@/components/feedback/url-feedback-toast";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  isLocale,
  isRtlLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import "../globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "ar";
  const dict = getDictionary(safeLocale);

  return {
    title: dict.app.name,
    description: dict.app.tagline,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  return (
    <html
      lang={typedLocale}
      dir={isRtlLocale(typedLocale) ? "rtl" : "ltr"}
      className={`${cairo.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Suspense fallback={null}>
          <UrlFeedbackToast locale={typedLocale} dict={dict} />
        </Suspense>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
