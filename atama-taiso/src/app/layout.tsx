import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSw from "@/components/RegisterSw";

export const metadata: Metadata = {
  title: "頭の体操",
  description: "毎朝5分の頭の体操と、きょうの記録",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "頭の体操",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F57C1F",
  width: "device-width",
  initialScale: 1,
  // 拡大操作を禁止しない（シニアがピンチ拡大できるように maximumScale は設定しない）
};

const mojiScript = `
try {
  var m = localStorage.getItem("moji-size");
  if (m === "ookii" || m === "tokudai") {
    document.documentElement.setAttribute("data-moji", m);
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: mojiScript }} />
      </head>
      <body>
        <RegisterSw />
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
