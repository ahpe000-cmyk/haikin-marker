"use client";

import type { ReactNode } from "react";
import { AppStateProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <ToastProvider>{children}</ToastProvider>
    </AppStateProvider>
  );
}
