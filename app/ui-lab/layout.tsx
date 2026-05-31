import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "../globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مختبر الواجهات",
  description: "نماذج واجهات عربية تجريبية معزولة عن التطبيق الإنتاجي",
};

export default function UiLabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-100 font-sans text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
