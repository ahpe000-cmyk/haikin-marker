import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "学ぶ",
};

const CATEGORIES = [
  {
    href: "/learn/business-terms",
    label: "ビジネス用語",
    description: "KPI・アジェンダなど、会議で飛び交う言葉を正しく使う",
  },
  {
    href: "/learn/judgment",
    label: "あなたならどうする？",
    description: "報告・優先順位・顧客対応。現場の判断力を磨く",
  },
  {
    href: "/learn/risk",
    label: "リスク管理",
    description: "誤送信・情報漏えい・クレーム。初動を間違えない",
  },
  {
    href: "/learn/current-affairs",
    label: "時事",
    description: "仕事に効く最新ニュースを5問で",
  },
] as const;

export default function LearnPage() {
  return (
    <div>
      <h1 className="pt-2 text-xl font-bold">学ぶ</h1>
      <p className="mt-1 text-sm text-muted">
        1ジャンル5問。STEPを進めてレベルアップ。
      </p>
      <div className="mt-4 space-y-3">
        {CATEGORIES.map((category) => (
          <Link key={category.href} href={category.href} className="block">
            <Card className="transition-colors duration-150 hover:border-accent">
              <h2 className="font-bold">{category.label}</h2>
              <p className="mt-1 text-sm text-muted">{category.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
