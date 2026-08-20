import type { Metadata } from "next";
import { PollScreen } from "@/components/poll/PollScreen";

export const metadata: Metadata = {
  title: "みんなならどうする？",
};

export default function PollPage() {
  return <PollScreen />;
}
