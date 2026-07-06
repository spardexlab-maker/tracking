"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editCommentAction, deleteCommentAction } from "@/lib/actions/task";
import { FileText, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/i18n/format";

interface CommentItemProps {
  comment: {
    id: string;
    body: string;
    created_at: string;
    author: {
      id: string;
      full_name: string | null;
      email: string;
    };
  };
  currentUserId: string;
  isLeader: boolean;
  locale: "ar" | "en";
  taskId: string;
  workspaceId: string;
  attachments: Array<{
    id: string;
    file_name: string;
    file_size: number;
    mime_type?: string | null;
  }>;
  dict: any;
}

export function CommentItem({
  comment,
  currentUserId,
  isLeader,
  locale,
  taskId,
  workspaceId,
  attachments,
  dict,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [newFileName, setNewFileName] = useState<string | null>(null);

  // Parse linked attachment in body
  const attachmentRegex = /\[attachment:([0-9a-fA-F-]{36})\]/;
  const match = comment.body.match(attachmentRegex);
  const attachmentId = match ? match[1] : null;
  const cleanBody = comment.body.replace(attachmentRegex, "").trim();

  // Find linked attachment object
  const linkedAttachment = attachmentId
    ? attachments.find((att) => att.id === attachmentId)
    : null;

  const authorObj = comment.author;
  const authorName =
    authorObj?.full_name ??
    authorObj?.email ??
    (locale === "ar" ? "مستخدم غير معروف" : "Unknown User");

  const canEdit = authorObj?.id === currentUserId;
  const canDelete = authorObj?.id === currentUserId || isLeader;

  if (isEditing) {
    return (
      <div className="rounded-2xl border bg-muted/40 p-4 text-start">
        <form action={editCommentAction} className="grid gap-3" encType="multipart/form-data">
          <input type="hidden" name="commentId" value={comment.id} />
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="deleteAttachment" value={deleteChecked ? "true" : "false"} />

          <Textarea
            name="body"
            defaultValue={cleanBody}
            required
            rows={3}
            className="resize-none bg-background"
          />

          {linkedAttachment && (
            <div className="flex items-center gap-2 bg-background p-2.5 rounded-xl border max-w-sm">
              <FileText className="size-4 text-primary shrink-0" />
              <span className="text-xs truncate flex-1 font-medium">{linkedAttachment.file_name}</span>
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0 text-red-600 text-xs font-semibold select-none">
                <input
                  type="checkbox"
                  checked={deleteChecked}
                  onChange={(e) => setDeleteChecked(e.target.checked)}
                  className="accent-red-600 size-3.5"
                />
                <span>{locale === "ar" ? "إزالة المرفق" : "Remove file"}</span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground">
                {newFileName || (locale === "ar" ? "استبدال/إرفاق ملف جديد" : "Replace/Attach new file")}
              </span>
              <input
                type="file"
                name="attachment"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setNewFileName(file ? file.name : null);
                  if (file) {
                    setDeleteChecked(true); // Automatically flag old attachment for deletion when uploading replacement
                  }
                }}
              />
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="rounded-xl h-9"
              >
                {dict.common.cancel}
              </Button>
              <Button size="sm" className="px-5 rounded-xl h-9">
                {locale === "ar" ? "حفظ التعديل" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-muted/20 p-3 text-start hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
        <span className="text-sm font-semibold text-foreground">{authorName}</span>
        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at, locale)}</span>
      </div>
      {cleanBody && (
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{cleanBody}</p>
      )}

      {linkedAttachment && !deleteChecked && (
        <div className="mt-3 border-t border-border/30 pt-3">
          {linkedAttachment.mime_type?.startsWith("image/") ? (
            <Link
              href={`/${locale}/api/attachments/${linkedAttachment.id}`}
              target="_blank"
              className="block rounded-xl overflow-hidden border max-w-sm hover:opacity-95 transition-opacity"
            >
              <img
                src={`/${locale}/api/attachments/${linkedAttachment.id}`}
                alt={linkedAttachment.file_name}
                className="w-full max-h-60 object-contain bg-slate-50 dark:bg-slate-900"
              />
            </Link>
          ) : (
            <Link
              href={`/${locale}/api/attachments/${linkedAttachment.id}`}
              target="_blank"
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-xs hover:bg-muted transition-colors max-w-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="truncate font-medium text-foreground">{linkedAttachment.file_name}</span>
              </span>
              <span className="text-primary font-semibold shrink-0">{dict.common.open}</span>
            </Link>
          )}
        </div>
      )}

      {(canEdit || canDelete) && (
        <div className="flex items-center gap-3 mt-3 border-t border-border/20 pt-2 text-xs">
          {canEdit && (
            <button
              onClick={() => {
                setIsEditing(true);
                setDeleteChecked(false);
                setNewFileName(null);
              }}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Edit3 className="size-3.5" />
              <span>{locale === "ar" ? "تعديل" : "Edit"}</span>
            </button>
          )}
          {canDelete && (
            <form
              action={deleteCommentAction}
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    locale === "ar"
                      ? "هل أنت متأكد من حذف هذا التعليق؟ سيتم أيضاً حذف المرفق المربوط به نهائياً."
                      : "Are you sure you want to delete this comment? Its linked attachment will also be permanently deleted."
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="taskId" value={taskId} />
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>{locale === "ar" ? "حذف" : "Delete"}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
