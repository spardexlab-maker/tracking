export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en" ? "en" : "ar";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isRtlLocale(locale: Locale) {
  return locale === "ar";
}

export function normalizeLocale(value: string): Locale {
  return value === "en" ? "en" : "ar";
}
