import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="enterprise-panel max-w-md p-6 text-center">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          الرابط غير صحيح أو لم تعد الصفحة متاحة.
        </p>
        <Link href="/ar/dashboard" className={buttonVariants({ className: "mt-5" })}>
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </main>
  );
}

