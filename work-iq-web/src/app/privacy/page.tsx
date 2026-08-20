import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "プライバシー",
  description: "WORK IQのデータの扱いについて。",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-xl font-bold">プライバシー</h1>
      <p className="text-sm text-muted">
        WORK IQは、できる限り個人情報を集めない設計で運営しています。
      </p>

      <Card>
        <h2 className="text-sm font-bold">アカウント登録はありません</h2>
        <p className="mt-2 text-sm leading-relaxed">
          ログイン機能はなく、氏名・メールアドレス・電話番号・勤務先などの個人情報を入力していただくことはありません。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">学習記録はブラウザ内に保存されます</h2>
        <p className="mt-2 text-sm leading-relaxed">
          クイズの回答履歴、スコア、STEPの進捗、復習スケジュール、連続挑戦日数は、お使いのブラウザのlocalStorageにのみ保存されます。当社のサーバーには送信されません。ブラウザのデータを削除すると学習記録も消えます。端末をまたいだ同期はできません。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">アンケートの投票データ</h2>
        <p className="mt-2 text-sm leading-relaxed">
          「みんなならどうする？」への投票は、集計のためにサーバーへ送信されます。保存されるのは、アンケートID・選んだ選択肢・匿名の端末識別子をハッシュ化した値・投票日時のみです。ハッシュ化は一方向で、そこから個人を特定することはできません。同じブラウザからの重複投票を防ぐ目的にのみ使用します。
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          表示される投票結果は実際の集計値ですが、回答者は本サービスの利用者に限られるため、社会全体を代表する統計的な調査結果ではありません。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">匿名の利用状況データ</h2>
        <p className="mt-2 text-sm leading-relaxed">
          サービス改善のため、「クイズを開始した」「結果を表示した」といった操作イベントを匿名で記録しています。記録されるのは、イベント名・画面のパス・カテゴリやSTEP・問題ID・匿名の端末識別子をハッシュ化した値・日時のみです。氏名・メールアドレス・IPアドレス・自由入力テキスト・広告用IDは収集しません。ユーザーのフィンガープリンティングも行いません。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">外部サービスへのリンク</h2>
        <p className="mt-2 text-sm leading-relaxed">
          結果画面やアンケート画面に、関連サービス（HONNE / BEFoAF）や時事問題の出典記事へのリンクが表示されることがあります。リンク先のサイトでのデータの扱いは、各サイトのプライバシーポリシーに従います。
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold">お問い合わせ</h2>
        <p className="mt-2 text-sm leading-relaxed">
          データの扱いについてのご質問は、本サービスの運営者までお問い合わせください。
        </p>
      </Card>
    </div>
  );
}
