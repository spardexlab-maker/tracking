"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function UploadAttachmentForm({
  locale,
  dict,
  workspaceId,
  taskId,
}: {
  locale: Locale;
  dict: Dictionary;
  workspaceId: string;
  taskId: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${workspaceId}/${taskId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        throw new Error(uploadError.message || JSON.stringify(uploadError));
      }

      const response = await fetch(`/${locale}/api/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          workspaceId,
          objectPath: path,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save attachment metadata in database");
      }

      toast.success(
        locale === "ar" ? "تم رفع المرفق بنجاح." : "Attachment uploaded.",
      );
      router.refresh();
    } catch (err: any) {
      console.error("UPLOAD_ATTACHMENT_ERROR:", err);
      toast.error(
        locale === "ar"
          ? `تعذر رفع المرفق: ${err.message || err}`
          : `Unable to upload attachment: ${err.message || err}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="grid gap-2 rounded-2xl border bg-background p-3">
      <span className="text-sm text-muted-foreground">{dict.tasks.uploadAttachment}</span>
      <input
        type="file"
        onChange={handleChange}
        disabled={busy}
        className="block w-full text-sm file:me-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
      />
    </label>
  );
}
