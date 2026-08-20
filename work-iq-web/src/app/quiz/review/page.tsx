import type { Metadata } from "next";
import { ReviewLoader } from "@/components/quiz/ReviewLoader";
import { loadAllQuestions } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "復習",
};

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  return <ReviewLoader allQuestions={loadAllQuestions()} />;
}
