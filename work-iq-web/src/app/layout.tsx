import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "WORK IQ — 社会人力を、毎日5問で。",
    template: "%s | WORK IQ",
  },
  description:
    "あなたの社会人力、何点？ ビジネス用語・実務判断・リスク管理・時事を1日5問、約3分で。ログイン不要で今すぐ挑戦できます。",
  ...(siteUrl
    ? {
        metadataBase: new URL(siteUrl),
        alternates: { canonical: "/" },
      }
    : {}),
  openGraph: {
    title: "WORK IQ — 社会人力を、毎日5問で。",
    description:
      "あなたの社会人力、何点？ 1日5問・約3分で学べる社会人向けクイズ。ログイン不要。",
    type: "website",
    locale: "ja_JP",
    siteName: "WORK IQ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
