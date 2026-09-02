"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  TrendingUp,
  Trophy,
  UserPlus,
} from "lucide-react";
import type { AppNotification, NotificationKind } from "@/types";
import { useAppState } from "@/lib/store";
import { listNotifications } from "@/repositories/notifications";
import { getActor } from "@/repositories/actors";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { cn, formatRelativeTime } from "@/lib/utils";

const KIND_ICONS: Record<NotificationKind, typeof Bell> = {
  follow: UserPlus,
  reproduction: Repeat2,
  comment: MessageCircle,
  like: Heart,
  ranking: Trophy,
  trending: TrendingUp,
};

function notificationHref(n: AppNotification): string {
  if (n.postId) return `/post/${n.postId}`;
  if (n.dateId) return `/date/${n.dateId}`;
  if (n.actorId)
    return n.actorId.startsWith("c") ? `/couple/${n.actorId}` : `/profile/${n.actorId}`;
  return "/";
}

/** SCREEN 15: Notifications (UI only, no push). */
export default function NotificationsPage() {
  const { state, ready, dispatch } = useAppState();

  // Opening the screen clears the unread badge
  useEffect(() => {
    if (ready && !state.notificationsRead) {
      dispatch({ type: "MARK_NOTIFICATIONS_READ" });
    }
  }, [ready, state.notificationsRead, dispatch]);

  if (!ready) {
    return (
      <>
        <PageHeader title="通知" />
        <LoadingState variant="list" />
      </>
    );
  }

  const notifications = listNotifications();

  return (
    <>
      <PageHeader title="通知" />
      {notifications.length === 0 ? (
        <EmptyState
          title="通知はまだありません"
          description="フォローや再現などのアクティビティがここに届きます"
        />
      ) : (
        <ul className="divide-y divide-line">
          {notifications.map((n) => {
            const Icon = KIND_ICONS[n.kind];
            const actor = n.actorId ? getActor(n.actorId) : undefined;
            const unread = !n.read && !state.notificationsRead;
            return (
              <li key={n.id}>
                <Link
                  href={notificationHref(n)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3.5 hover:bg-ink/[0.02]",
                    unread && "bg-accent-soft/40"
                  )}
                >
                  {actor ? (
                    <Avatar src={actor.avatar} name={actor.displayName} />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5">
                      <Icon className="h-5 w-5 text-muted" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{n.message}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Icon className="h-3 w-3" aria-hidden />
                      <time dateTime={n.createdAt}>{formatRelativeTime(n.createdAt)}</time>
                    </p>
                  </div>
                  {unread && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                      aria-label="未読"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
