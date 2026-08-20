import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ScoreDisclaimer } from "@/components/progress/ScoreDisclaimer";

export const metadata: Metadata = {
  title: "WORK IQについて",
  description:
    "WORK IQは、社会人力を毎日5問で磨くためのサービスです。ログイン不要・無料で使えます。",
};

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-xl font-bold">WORK IQについて</h1>

      <Card>
        <p className="text-lg font-bold">社会人力を、毎日5問で。</p>
        <p className="mt-2 text-sm leading-relaxed">
          WORK IQは、働く大人のための学習サービスです。ビジネス用語、実務の判断、リスク管理、時事の4ジャンルから毎日5問。1回約3分で、仕事に効く知識と判断の型を積み上げます。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">できること</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>今日の5問：毎日変わるミックス出題</li>
          <li>ジャンル別STEP：5問×5STEPで段階的にレベルアップ</li>
          <li>WORK IQスコア：学びの積み上がりを1つの数字で</li>
          <li>復習：間違えた問題が1日→3日→7日→30日の間隔で再登場</li>
          <li>みんなならどうする？：正解のない質問に、みんなの実際の回答分布</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">WORK IQスコアとは</h2>
        <p className="mt-2 text-sm leading-relaxed">
          回答の正確さと問題の種類（知識・使い方・判断）をもとに計算する、学習の積み上げを示すスコアです。順位や偏差値ではなく、あなた自身の成長を測るためのものです。
        </p>
        <div className="mt-3 border-t border-line pt-3">
          <ScoreDisclaimer />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">ログインは不要です</h2>
        <p className="mt-2 text-sm leading-relaxed">
          アカウント登録なしで、開いたその日から使えます。学習の記録はお使いのブラウザにのみ保存されます。詳しくは
          <Link href="/privacy" className="text-accent underline">
            プライバシー
          </Link>
          をご覧ください。
        </p>
      </Card>

      <ButtonLink href="/quiz/daily" className="w-full">
        今日の5問に挑戦
      </ButtonLink>
    </div>
  );
}
