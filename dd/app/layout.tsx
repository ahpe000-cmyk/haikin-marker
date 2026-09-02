import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { BottomNavigation } from "@/components/shared/bottom-navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "DD — Date × Decoration",
    template: "%s | DD",
  },
  description:
    "デートを投稿する。見つける。真似する。誰かの最高のデートが、次の誰かの思い出になる。デート体験を共有するSNS「DD」。",
  openGraph: {
    title: "DD — Date × Decoration",
    description: "デートを投稿する。見つける。真似する。デート体験を共有するSNS。",
    type: "website",
    siteName: "DD",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Providers>
          <div className="mx-auto min-h-dvh w-full max-w-app bg-paper shadow-sm sm:border-x sm:border-line">
            <main className="pb-24">{children}</main>
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
