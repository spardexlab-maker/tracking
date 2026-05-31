import Link from "next/link";
import { Languages } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  path = "dashboard",
}: {
  locale: Locale;
  path?: string;
}) {
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={`/${nextLocale}/${path}`}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
    >
      <Languages className="size-4" />
      {nextLocale === "ar" ? "العربية" : "English"}
    </Link>
  );
}
