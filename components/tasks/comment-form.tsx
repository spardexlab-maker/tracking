"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/lib/actions/task";

export function CommentForm({
  locale,
  taskId,
  workspaceId,
  placeholderText,
  attachText,
  submitText,
}: {
  locale: string;
  taskId: string;
  workspaceId: string;
  placeholderText: string;
  attachText: string;
  submitText: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="border-t pt-4 mt-2">
      <form action={addCommentAction} className="grid gap-3" encType="multipart/form-data">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="workspaceId" value={workspaceId} />
        
        <Textarea
          name="body"
          placeholder={placeholderText}
          required
          rows={3}
          className="resize-none"
        />
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-muted-foreground">
              {fileName || attachText}
            </span>
            <input
              type="file"
              name="attachment"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                } else {
                  setFileName(null);
                }
              }}
            />
          </label>
          <Button size="sm" className="px-5">
            {submitText}
          </Button>
        </div>
      </form>
    </div>
  );
}
