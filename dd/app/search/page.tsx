"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getAllDates } from "@/lib/selectors";
import { filterDates } from "@/repositories/dates";
import { searchActors } from "@/repositories/actors";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DateCard } from "@/components/date/date-card";
import { FollowButton } from "@/components/social/follow-button";
import { actorProfileHref } from "@/components/social/post-header";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { DEMO_USER_ID } from "@/data/mock";

type SearchTab = "dates" | "users" | "couples";

/** SCREEN 05: Search Results (Dates / Users / Couples tabs). */
export default function SearchPage() {
  const { state, ready } = useAppState();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("dates");

  const dateResults = useMemo(
    () => (ready ? filterDates(getAllDates(state), { query }) : []),
    [ready, state, query]
  );
  const userResults = useMemo(
    () => searchActors(query, "individual").filter((a) => a.id !== DEMO_USER_ID),
    [query]
  );
  const coupleResults = useMemo(() => searchActors(query, "couple"), [query]);

  if (!ready) {
    return (
      <>
        <PageHeader title="検索" />
        <LoadingState variant="list" />
      </>
    );
  }

  const actorList = (actors: typeof userResults) =>
    actors.length === 0 ? (
      <EmptyState title="見つかりませんでした" description="キーワードを変えてみてください" />
    ) : (
      <ul className="divide-y divide-line">
        {actors.map((a) => (
          <li key={a.id} className="flex items-center gap-3 px-4 py-3">
            <Link href={actorProfileHref(a.id)} className="shrink-0">
              <Avatar src={a.avatar} name={a.displayName} />
            </Link>
            <Link href={actorProfileHref(a.id)} className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                {a.displayName}
                <Badge variant={a.type === "couple" ? "couple" : "default"}>
                  {a.type === "couple" ? "Couple" : "Individual"}
                </Badge>
              </p>
              <p className="truncate text-xs text-muted">
                @{a.username} ・ {a.location}
              </p>
            </Link>
            <FollowButton actorId={a.id} />
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader title="検索" />
      <div className="px-4 pt-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <label htmlFor="search-input" className="sr-only">
            検索キーワード
          </label>
          <Input
            id="search-input"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="エリア・キーワード・名前で検索"
            autoFocus
          />
        </div>
      </div>

      <div className="pt-3">
        <Tabs
          items={[
            { value: "dates", label: "デート" },
            { value: "users", label: "ユーザー" },
            { value: "couples", label: "カップル" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "dates" &&
        (dateResults.length === 0 ? (
          <EmptyState
            title="デートが見つかりません"
            description="「銀座」「初デート」「低予算」などで検索してみてください"
          />
        ) : (
          <div className="space-y-3 p-4">
            {dateResults.map((d) => (
              <DateCard key={d.id} date={d} />
            ))}
          </div>
        ))}
      {tab === "users" && actorList(userResults)}
      {tab === "couples" && actorList(coupleResults)}
    </>
  );
}
