import { ErrorState } from "@/components/shared/states";

export default function NotFound() {
  return (
    <ErrorState
      title="ページが見つかりません"
      description="URLが間違っているか、コンテンツが削除された可能性があります。"
    />
  );
}
