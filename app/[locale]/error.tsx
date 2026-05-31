"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="enterprise-panel max-w-md p-6 text-center">
        <p className="text-sm text-muted-foreground">Error</p>
        <h1 className="mt-2 text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أعد المحاولة، وإذا استمر الخطأ افحص الاتصال أو إعدادات Supabase.
        </p>
        <Button onClick={reset} className="mt-5">
          إعادة المحاولة
        </Button>
      </div>
    </main>
  );
}

