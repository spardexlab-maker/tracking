"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { WorkspaceLogo } from "./workspace-logo";

export function UploadWorkspaceLogoForm({
  locale,
  workspaceId,
  labelName,
  buttonText,
  errorText,
  successText,
}: {
  locale: string;
  workspaceId: string;
  labelName: string;
  buttonText: string;
  errorText: string;
  successText: string;
}) {
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0); // to force refresh logo image in Settings view
  const router = useRouter();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // limit to 2MB
    if (file.size > 1024 * 1024 * 2) {
      toast.error(
        locale === "ar"
          ? "حجم الملف كبير جداً. يجب أن يكون أقل من 2 ميجابايت."
          : "File size is too large. Max limit is 2MB."
      );
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const path = `${workspaceId}/logo.png`;

    const { error } = await supabase.storage
      .from("workspace-logos")
      .upload(path, file, { upsert: true });

    if (!error) {
      toast.success(successText);
      setKey((prev) => prev + 1);
      router.refresh();
    } else {
      console.error("Storage upload error:", error);
      toast.error(errorText);
    }

    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div key={key}>
        <WorkspaceLogo workspaceId={workspaceId} fallbackText="م" />
      </div>
      <label className="flex-1 grid gap-2 rounded-2xl border bg-background p-3 cursor-pointer hover:bg-muted/50 transition-colors">
        <span className="text-sm font-medium">{labelName}</span>
        <input
          type="file"
          accept="image/png, image/jpeg, image/gif, image/svg+xml"
          onChange={handleChange}
          disabled={busy}
          className="block w-full text-xs text-muted-foreground file:me-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground file:text-xs file:font-semibold"
        />
      </label>
    </div>
  );
}
