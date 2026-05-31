import Link from "next/link";
import { FileText, ImageIcon, Paperclip } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function AttachmentList({
  locale,
  dict,
  attachments,
}: {
  locale: Locale;
  dict: Dictionary;
  attachments: Array<{
    id: string;
    file_name: string;
    file_size: number;
    mime_type?: string | null;
  }>;
}) {
  return (
    <div className="grid gap-2">
      {attachments.length === 0 ? (
        <p className="rounded-2xl border bg-background p-3 text-sm text-muted-foreground">
          —
        </p>
      ) : (
        attachments.map((attachment) => {
          const Icon = attachment.mime_type?.startsWith("image/")
            ? ImageIcon
            : attachment.mime_type === "application/pdf"
              ? FileText
              : Paperclip;
          return (
            <Link
              key={attachment.id}
              href={`/${locale}/api/attachments/${attachment.id}`}
              target="_blank"
              className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3 text-sm transition hover:bg-muted"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{attachment.file_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(attachment.file_size)}
                  </span>
                </span>
              </span>
              <span className="text-xs font-medium text-primary">{dict.common.open}</span>
            </Link>
          );
        })
      )}
    </div>
  );
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
