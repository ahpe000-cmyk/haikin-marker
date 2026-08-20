import type { Metadata } from "next";
import { ResultScreen } from "@/components/result/ResultScreen";
import { loadAllQuestions } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "結果",
};

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <ResultScreen sessionId={sessionId} allQuestions={loadAllQuestions()} />
  );
}
