import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StepList } from "@/components/learn/StepList";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import {
  CATEGORY_LABELS,
  SLUG_TO_CATEGORY,
  isEvergreenSlug,
} from "@/lib/domain/categories";
import { loadCurrentAffairsBatches } from "@/lib/content/load";
import { getFreshCurrentAffairs } from "@/lib/quiz/current-affairs";
import { getJstDateKey } from "@/lib/time/jst";

export const dynamic = "force-dynamic";

const DESCRIPTIONS: Record<string, string> = {
  "business-terms":
    "会議・メール・商談で使う言葉を、意味だけでなく「いつ・誰に使うか」まで。",
  judgment:
    "報告・優先順位・顧客対応。多くの問題は「おすすめの判断」形式で、状況による違いも学べます。",
  risk: "誤送信・紛失・クレーム。初動と再発防止の型を身につけます。",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (category === "current-affairs") return { title: "時事" };
  if (isEvergreenSlug(category)) {
    return { title: CATEGORY_LABELS[SLUG_TO_CATEGORY[category]] };
  }
  return {};
}

export default async function LearnCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (category === "current-affairs") {
    const fresh = getFreshCurrentAffairs(
      loadCurrentAffairsBatches(),
      getJstDateKey(),
    );
    return (
      <div>
        <BackLink />
        <h1 className="text-xl font-bold">時事</h1>
        <p className="mt-1 text-sm text-muted">
          最新の検証済みニュースから出題。STEPのロックはありません。
        </p>
        <Card className="mt-4">
          {fresh.length > 0 ? (
            <>
              <p className="text-sm">今日の時事{fresh.length}問が届いています。</p>
              <ButtonLink
                href="/quiz/current-affairs"
                className="mt-3 w-full"
              >
                今日の時事に挑戦
              </ButtonLink>
            </>
          ) : (
            <p className="text-sm text-muted">
              今日の時事問題は更新準備中です。今日の5問や他のジャンルに挑戦してみてください。
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (!isEvergreenSlug(category)) notFound();

  return (
    <div>
      <BackLink />
      <h1 className="text-xl font-bold">
        {CATEGORY_LABELS[SLUG_TO_CATEGORY[category]]}
      </h1>
      <p className="mt-1 text-sm text-muted">{DESCRIPTIONS[category]}</p>
      <StepList slug={category} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/learn"
      className="mb-3 inline-flex min-h-[44px] items-center pt-2 text-sm text-muted hover:text-foreground"
    >
      ← 学ぶへ戻る
    </Link>
  );
}
