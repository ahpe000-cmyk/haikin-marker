import type { Metadata } from "next";
import { ProgressScreen } from "@/components/progress/ProgressScreen";

export const metadata: Metadata = {
  title: "成長",
};

export default function ProgressPage() {
  return <ProgressScreen />;
}
