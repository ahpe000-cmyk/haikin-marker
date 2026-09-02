"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { getFeed, type FeedTab } from "@/lib/selectors";
import { AppHeader } from "@/components/shared/app-header";
import { Onboarding } from "@/components/shared/onboarding";
import { FeedPost } from "@/components/social/feed-post";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState, LoadingState } from "@/components/shared/states";

/** SCREEN 02: Home Feed — 人と投稿を発見する場所. */
export default function HomePage() {
  const { state, ready } = useAppState();
  const [tab, setTab] = useState<FeedTab>("recommended");

  const feed = ready ? getFeed(state, tab) : [];

  return (
    <>
      <Onboarding />
      <AppHeader />
      <div className="sticky top-[57px] z-20 bg-paper/95 backdrop-blur">
        <Tabs
          items={[
            { value: "recommended", label: "おすすめ" },
            { value: "following", label: "フォロー中" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {!ready ? (
        <LoadingState variant="feed" />
      ) : feed.length === 0 ? (
        <EmptyState
          title="まだ投稿がありません"
          description={
            tab === "following"
              ? "気になるCreatorやCoupleをフォローすると、ここに投稿が表示されます"
              : "最初の投稿を作ってみましょう"
          }
          actionLabel={tab === "following" ? "Creatorを探す" : "投稿する"}
          actionHref={tab === "following" ? "/discover" : "/create"}
        />
      ) : (
        <div>
          {feed.map((post, i) => (
            <FeedPost key={post.id} post={post} priority={i < 2} />
          ))}
        </div>
      )}
    </>
  );
}
