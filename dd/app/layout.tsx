import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/hooks/useDemoStore";
import { ToastProvider } from "@/components/dd/Toast";

export const metadata: Metadata = {
  title: "DD — Date × Decoration",
  description:
    "いいデートは、再現できる。デートの発見・保存・再現・投稿・評価ができるデート特化型SNSのデモアプリ（DEMO DATA）。",
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
        <DemoStoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
