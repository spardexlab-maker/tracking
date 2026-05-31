"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const successKeys = [
  "created",
  "reset",
  "sent",
  "invited",
  "created-user",
  "joined",
  "saved",
  "task-created",
  "comment-added",
  "progress-updated",
  "attachment-uploaded",
] as const;

const errorKeys = [
  "error",
] as const;

export function UrlFeedbackToast({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const searchParams = useSearchParams();
  const lastKey = useRef("");

  useEffect(() => {
    const key = searchParams.toString();
    if (!key || key === lastKey.current) return;
    lastKey.current = key;

    for (const item of successKeys) {
      if (searchParams.has(item)) {
        toast.success(messageFor(item, locale, dict));
        return;
      }
    }

    for (const item of errorKeys) {
      if (searchParams.has(item)) {
        toast.error(messageFor(item, locale, dict));
        return;
      }
    }
  }, [dict, locale, searchParams]);

  return null;
}

function messageFor(key: string, locale: Locale, dict: Dictionary) {
  const ar: Record<string, string> = {
    created: "تم إنشاء الحساب بنجاح.",
    reset: "تم تحديث كلمة المرور بنجاح.",
    sent: "تم إرسال رابط الاستعادة إن كان البريد مسجلًا.",
    invited: "تم إرسال الدعوة بنجاح.",
    "created-user": "تم إنشاء المستخدم وإضافته للمساحة.",
    joined: "تم قبول الدعوة والانضمام للمساحة.",
    saved: "تم الحفظ بنجاح.",
    "task-created": "تم إنشاء المهمة بنجاح.",
    "comment-added": "تمت إضافة التعليق.",
    "progress-updated": "تم تحديث تقدم المهمة.",
    "attachment-uploaded": "تم رفع المرفق.",
    error: "حدث خطأ. تحقق من البيانات وحاول مرة أخرى.",
  };

  const en: Record<string, string> = {
    created: "Account created successfully.",
    reset: "Password updated successfully.",
    sent: "Reset link sent if the email exists.",
    invited: "Invitation sent successfully.",
    "created-user": "User created and added to the workspace.",
    joined: "Invitation accepted.",
    saved: "Saved successfully.",
    "task-created": "Task created successfully.",
    "comment-added": "Comment added.",
    "progress-updated": "Task progress updated.",
    "attachment-uploaded": "Attachment uploaded.",
    error: "Something went wrong. Check the details and try again.",
  };

  return (locale === "ar" ? ar[key] : en[key]) ?? dict.feedback.genericError;
}

