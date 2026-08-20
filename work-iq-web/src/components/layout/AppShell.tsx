import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
