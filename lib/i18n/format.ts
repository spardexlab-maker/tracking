import { arSA, enUS } from "date-fns/locale";
import { format } from "date-fns";
import type { Locale } from "@/lib/i18n/config";

export function formatDate(value: string | Date | null, locale: Locale) {
  if (!value) return "—";
  return format(new Date(value), "d/M/yyyy");
}
