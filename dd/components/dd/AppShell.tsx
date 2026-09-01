import { BottomNavigation } from "@/components/dd/BottomNavigation";

// 画面共通のコンテナ。モバイル(390px)基準・デスクトップでは中央寄せ。
export function AppShell({
  children,
  bottomPadding = true,
}: {
  children: React.ReactNode;
  bottomPadding?: boolean;
}) {
  return (
    <div className="dd-fade-in min-h-dvh">
      <div
        className={`mx-auto w-full max-w-md lg:max-w-2xl ${
          bottomPadding ? "pb-24" : ""
        }`}
      >
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
