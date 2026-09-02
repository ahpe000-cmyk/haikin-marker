"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import { getSaved } from "@/lib/selectors";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs } from "@/components/ui/tabs";
import { SmartImage } from "@/components/shared/smart-image";
import { DateCard } from "@/components/date/date-card";
import { EmptyState, LoadingState } from "@/components/shared/states";

/** SCREEN 14: Saved posts & dates. */
export default function SavedPage() {
  const { state, ready } = useAppState();
  const [tab, setTab] = useState<"posts" | "dates">("posts");

  if (!ready) {
    return (
      <>
        <PageHeader title="保存済み" />
        <LoadingState variant="list" />
      </>
    );
  }

  const { posts, dates } = getSaved(state);

  return (
    <>
      <PageHeader title="保存済み" />
      <Tabs
        items={[
          { value: "posts", label: `投稿 ${posts.length}` },
          { value: "dates", label: `デート ${dates.length}` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "posts" &&
        (posts.length === 0 ? (
          <EmptyState
            title="保存した投稿がありません"
            description="気になる投稿を保存すると、ここにまとまります"
            actionLabel="フィードを見る"
            actionHref="/"
          />
        ) : (
          <div className="grid grid-cols-3 gap-0.5 pt-0.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                aria-label={post.caption.slice(0, 30)}
              >
                <SmartImage
                  src={post.media[0]?.url ?? ""}
                  alt={post.caption.slice(0, 30)}
                  aspect="1/1"
                />
              </Link>
            ))}
          </div>
        ))}

      {tab === "dates" &&
        (dates.length === 0 ? (
          <EmptyState
            title="保存したデートがありません"
            description="「あとでやりたい」デートを保存しておきましょう"
            actionLabel="デートを探す"
            actionHref="/discover"
          />
        ) : (
          <div className="space-y-3 p-4">
            {dates.map((d) => (
              <DateCard key={d.id} date={d} />
            ))}
          </div>
        ))}
    </>
  );
}
