/**
 * Mock repository for notifications (UI only, no push). See repositories/actors.ts.
 */
import type { AppNotification } from "@/types";
import { mockNotifications } from "@/data/mock";

export function listNotifications(): AppNotification[] {
  return [...mockNotifications].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}
